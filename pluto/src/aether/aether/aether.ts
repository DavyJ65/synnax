// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

import { Instrumentation } from "@synnaxlabs/alamos";
import { UnexpectedError, ValidationError } from "@synnaxlabs/client";
import { type Sender, type SenderHandler } from "@synnaxlabs/x";
import { z } from "zod";

import { type MainMessage, type WorkerMessage } from "@/aether/message";
import { state } from "@/state";
import { prettyParse } from "@/util/zod";

type UpdateVariant = "state" | "context";

/** An update to an AetherComponent from the main React tree. */
export interface Update {
  /**
   * The variant of update being performed. State updates are used to update
   * the state of a particular component, while context updates are used to propagate
   * context changes to children in the tree.
   */
  variant: UpdateVariant;
  /* The context provided by the parent component. */
  ctx: Context;
  /**
   * The path of the component in the tree. This path is shortened as the update is
   * propagated through the tree
   */
  path: string[];
  /**
   * The type of the component being updated. This is used to create the component
   * if it does not already exist.
   */
  type: string;
  /**
   * The state to udpate on the component . This is only present if the variant is
   * "state".
   */
  state: any;
}

/**
 * A component in the Aether tree. Each component instance has a unique key identifying
 * it within the tree, and also has a type identifying it's class. Components
 * implementing different functionality should have different types, and these types
 * typically correlate to the corresponding name of the component in the react tree.
 */
export interface Component {
  /** The type of component. */
  type: string;
  /** A unique key identifying the component within the tree. */
  key: string;
  /**
   * Propagates an update to the internal tree of the component, updating the component
   * itself and any children as necessary.
   *
   * @param update - The update to propagate.
   */
  internalUpdate: (update: Update) => void;
  /**
   * Propagates a delete to the internal tree of the component, calling the handleDelete
   * component on the component itself and any children as necessary. It is up to
   * the parent component to remove the child from its internal tree.
   *
   * @param path - The path of the component to delete.
   */
  internalDelete: (path: string[]) => void;
}

/** A constructor type for an AetherComponent. */
export type ComponentConstructor = new (update: Update) => Component;

/**
 * AetherContext is used to propagate environment information to components in the
 * aether tree. It allows components to propagate state changes to the main react
 * tree, create new components, and set/get values from the environment, passing
 * them to children as necessary.
 */
export class Context {
  readonly providers: Map<string, any>;
  private readonly registry: Record<string, ComponentConstructor>;
  private readonly sender: Sender<WorkerMessage>;
  changed: boolean;

  constructor(
    sender: Sender<WorkerMessage>,
    registry: Record<string, ComponentConstructor>,
    providers = new Map<string, any>(),
  ) {
    this.providers = providers;
    this.registry = registry;
    this.changed = false;
    this.sender = sender;
  }

  /**
   * Proapgates the given state for the component with the given key to the main
   * react tree.
   *
   * @param key - The key of the component to propagate the state for.
   * @param state - The state to propagate.
   * @param transfer - Any transferable objects to transfer to the main thread.
   */
  propagateState(key: string, state: any, transfer: Transferable[] = []): void {
    this.sender.send({ key, state }, transfer);
  }

  /**
   * Copies the context, setting it's 'changed' flag to false, and optionally merging
   * another set of context values into it.
   *
   * @param merge - The context to merge into the copy.
   * @returns The copied context.
   */
  copyAndMerge(merge?: Context): Context {
    const cpy = new Context(this.sender, this.registry, new Map());
    merge?.providers.forEach((value, key) => cpy.providers.set(key, value));
    this.providers.forEach((value, key) => cpy.providers.set(key, value));
    cpy.changed = false;
    return cpy;
  }

  /**
   * Sets a value on the context and flags the context as changed.
   *
   * @param key - The key to set.
   * @param value - The value to set.
   */
  set(key: string, value: any): void {
    this.providers.set(key, value);
    this.changed = true;
  }

  setIfNotHas(key: string, value: any): void {
    if (!this.providers.has(key)) this.set(key, value);
  }

  /**
   * Creates a new component using the given update. It is up to the caller to
   * validate that the component type is valid.
   *
   * @param update - The update to create the component from.
   * @returns The created component.
   */
  create<C extends Component>(update: Update): C {
    const Factory = this.registry[update.type];
    if (Factory == null)
      throw new Error(`[AetherRoot.create] - could not find component ${update.type}`);
    const c = new Factory(update) as C;
    c.internalUpdate(update);
    return c;
  }

  /**
   * Gets a value from the context, returning null if the value does not exist. It's
   * imporant to note that the context provides no validation of the type of the
   * value, so it is up to the caller to ensure that the value is of the correct type.
   *
   * @param key - The key to get.
   * @returns The value, or null if it does not exist.
   */
  getOptional<P>(key: string): P | null {
    return this.providers.get(key) ?? null;
  }

  /**
   * Checks if the context has a value for the given key.
   *
   * @param key - The key to check.
   * @returns True if the context has a value for the given key, false otherwise.
   */
  has(key: string): boolean {
    return this.providers.has(key);
  }

  /**
   * Gets a value from the context, throwing an error if the value does not exist.
   * It's imporant to note that the context provides no validation of the type of
   * the value, so it is up to the caller to ensure that the value is of the correct
   *
   * @param key - The key to get.
   * @returns The value.
   */
  get<P>(key: string): P {
    const value = this.getOptional<P>(key);
    if (value == null)
      throw new Error(`[AetherRoot.get] - could not find provider ${key}`);
    return value;
  }
}

/**
 * Implements an AtherComponent that does not have any children, and servers as the base
 * class for the AetherComposite type. The corresponding react component should NOT have
 * any children that use Aether functionality; for those cases, use AetherComposite instead.
 */
export class Leaf<S extends z.ZodTypeAny, IS extends {} = {}> implements Component {
  readonly type: string;
  readonly key: string;

  _ctx: Context;
  private readonly _internalState: IS;
  private _state: z.output<S> | undefined;
  private _prevState: z.output<S> | undefined;
  private _deleted: boolean = false;

  schema: S | undefined = undefined;

  constructor(u: Update) {
    this.type = u.type;
    this.key = u.path[0];
    this._ctx = u.ctx;
    this._internalState = {} as unknown as IS;
  }

  private get _schema(): S {
    if (this.schema == null)
      throw new ValidationError(
        `[AetherLeaf] - expected subclass to define component schema, but none was found. 
        Make sure to defne a property 'schema' on the class.`,
      );
    return this.schema;
  }

  /**
   * Sets the state on the component, communicating the change to the corresponding
   * React component on the main thread.
   *
   * @param next - The new state to set on the component. This can be the state object
   * or a pure function that takes in the previous state and returns the next state.
   */
  setState(next: state.SetArg<z.input<S> | z.output<S>>): void {
    const nextState: z.input<S> = state.executeSetter(next, this._state);
    this._prevState = { ...this._state };
    this._state = prettyParse(this._schema, nextState, `${this.type}:${this.key}`);
    this.ctx.propagateState(this.key, nextState);
  }

  /** Returns the current context on the component. */
  get ctx(): Context {
    if (this._ctx == null) throw new UnexpectedError("context not defined");
    return this._ctx;
  }

  /** @returns the current state of the component. */
  get state(): z.output<S> {
    if (this._state == null) throw new UnexpectedError("state not defined");
    return this._state;
  }

  get internal(): IS {
    return this._internalState;
  }

  /** @returns the previous state of the component. */
  get prevState(): z.output<S> {
    return this._prevState;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  /**
   * @implements AetherComponent, and should NOT be called by a subclass other than
   * AetherComposite.
   */
  internalUpdate({ variant, path, ctx, state }: Update): void {
    this._ctx = ctx;
    if (variant === "state") {
      this.validatePath(path);
      const state_ = prettyParse(this._schema, state, `${this.type}:${this.key}`);
      this._prevState = this._state ?? state_;
      this._state = state_;
    }
    this.afterUpdate();
  }

  /**
   * @implements AetherComponent, and should NOT be called by a subclass other than
   * AetherComposite.
   */
  internalDelete(path: string[]): void {
    this.validatePath(path);
    this._deleted = true;
    this.afterDelete();
  }

  /**
   * afterUpdate is optionally defined by a subclass, allowing the component to
   * perform some action after the component is updated. At this point, the current
   * state, previous state, derived state, and current context are all available to
   * the component.
   */
  afterUpdate(): void {}

  /**
   * Runs after the component has been spliced out of the tree. This is useful for
   * running cleanup code, such as unsubscribing from an event emitter.
   */
  afterDelete(): void {}

  private validatePath(path: string[]): void {
    if (path.length === 0)
      throw new UnexpectedError(
        `[Leaf.setState] - ${this.type}:${this.key} received an empty path`,
      );
    const key = path[path.length - 1];
    if (path.length > 1)
      throw new UnexpectedError(
        `[Leaf.setState] - ${this.type}:${this.key} received a subPath ${path.join(
          ".",
        )} but is a leaf`,
      );
    if (key !== this.key)
      throw new UnexpectedError(
        `[Leaf.setState] - ${this.type}:${this.key} received a key ${key} but expected ${this.key}`,
      );
  }
}

/**
 * AetherComposite is an implementation of AetherComponent that allows it to maintain
 * child components. It is the base class for all composite components, and should not
 * be used directly.
 */
export class Composite<
    S extends z.ZodTypeAny,
    IS extends {} = {},
    C extends Component = Component,
  >
  extends Leaf<S, IS>
  implements Component
{
  _children: C[];

  constructor(u: Update) {
    super(u);
    this._children = [];
  }

  /** @returns a readonly array of the children of the component. */
  get children(): readonly C[] {
    return this._children;
  }

  /**
   * @implements AetherComponent, and should NOT be called by a subclass, except for
   * AetherRoot.
   */
  internalUpdate(u: Update): void {
    const { variant, path } = u;

    if (variant === "context") {
      // We need to assume the context has changed, so we need to copy and merge the
      // context before updating the component.
      this._ctx = u.ctx.copyAndMerge(this._ctx);
      return this.updateContext({ ...u, ctx: this.ctx });
    }

    const [key, subPath] = this.getRequiredKey(path);
    // In this case, we can safely assume the context hasn't changed, so we can just use
    // the internal, cached context.
    const uCached = { ...u, ctx: this.ctx };
    return subPath.length === 0
      ? this.updateThis(key, uCached)
      : this.updateChild(subPath, uCached);
  }

  private updateContext(u: Update): void {
    super.internalUpdate(u);
    this.children.forEach((c) => c.internalUpdate(u));
  }

  private updateChild(subPath: string[], u: Update): void {
    const childKey = subPath[0];
    const child = this.findChild(childKey);
    if (child != null) return child.internalUpdate({ ...u, path: subPath });
    if (subPath.length > 1)
      throw new Error(
        `[Composite.setState] - ${this.type}:${this.key} could not find child with key ${childKey} while updating `,
      );
    this._children.push(u.ctx.create({ ...u, path: subPath }));
  }

  private updateThis(key: string, u: Update): void {
    const ctx = u.ctx.copyAndMerge(this._ctx);
    // Check if super altered the context. If so, we need to re-render children.
    if (key !== this.key)
      throw new UnexpectedError(
        `[Composite.update] - ${this.type}:${this.key} received a key ${key} but expected ${this.key}`,
      );
    super.internalUpdate({ ...u, ctx });
    if (!ctx.changed) return;
    this.children.forEach((c) =>
      c.internalUpdate({ ...u, ctx: this.ctx, variant: "context" }),
    );
  }

  internalDelete(path: string[]): void {
    const [key, subPath] = this.getRequiredKey(path);
    if (subPath.length === 0) {
      if (key !== this.key) {
        throw new Error(
          `[Composite.delete] - ${this.type}:${this.key} received a key ${key} but expected ${this.key}`,
        );
      }
      const c = this.children;
      this._children = [];
      c.forEach((c) => c.internalDelete([c.key]));
      super.internalDelete([this.key]);
      return;
    }
    const child = this.findChild(subPath[0]);
    if (child == null) return;
    if (subPath.length > 1) child.internalDelete(subPath);
    else {
      this._children.splice(this.children.indexOf(child), 1);
      child.internalDelete(subPath);
    }
  }

  getRequiredKey(path: string[], type?: string): [string, string[]] {
    const [key, ...subPath] = path;
    if (key == null)
      throw new Error(
        `Composite ${this.type}:${this.key} received an empty path` +
          (type != null ? ` for ${type}` : ""),
      );
    return [key, subPath];
  }

  /**
   * Finds a child component with the given key.
   *
   * @param key - the key of the child component to find.
   * @returns the child component, or null if no child component with the given key
   */
  findChild<T extends C = C>(key: string): T | null {
    return (this.children.find((c) => c.key === key) ?? null) as T | null;
  }

  /**
   * Finds all children of the component with the given type
   *
   * @param types - the type of the children to find
   * @returns an array of all children of the component with the given type
   */
  childrenOfType<T extends C = C>(...types: Array<T["type"]>): readonly T[] {
    return this.children.filter((c) =>
      types.includes(c.type),
    ) as unknown as readonly T[];
  }
}

export type ComponentRegistry = Record<string, ComponentConstructor>;

const aetherRootState = z.object({});

export interface RootProps {
  worker: SenderHandler<WorkerMessage, MainMessage>;
  registry: ComponentRegistry;
  instrumentation?: Instrumentation;
}

export class Root extends Composite<typeof aetherRootState> {
  wrap: SenderHandler<WorkerMessage, MainMessage>;
  instrumentation: Instrumentation;

  private static readonly TYPE = "root";
  private static readonly KEY = "root";

  private static readonly ZERO_UPDATE: Omit<Update, "ctx"> = {
    path: [Root.KEY],
    type: Root.TYPE,
    variant: "state",
    state: {},
  };

  static readonly schema = aetherRootState;
  schema = Root.schema;

  static render(props: RootProps): Root {
    return new Root(props);
  }

  private constructor({ worker: wrap, registry, instrumentation }: RootProps) {
    const ctx = new Context(wrap, registry, new Map());
    const u = { ctx, ...Root.ZERO_UPDATE };
    super(u);
    this.internalUpdate(u);
    this.wrap = wrap;
    this.wrap.handle(this.handle.bind(this));
    this.instrumentation = instrumentation ?? Instrumentation.NOOP;
  }

  handle(msg: MainMessage): void {
    try {
      if (msg.variant === "delete") this.internalDelete(msg.path);
      else {
        const u: Update = {
          ...msg,
          variant: "state",
          ctx: this.ctx,
        };
        this.internalUpdate(u);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

export const render = Root.render;
