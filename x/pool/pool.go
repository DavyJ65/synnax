package pool

import "sync"

type Adapter interface {
	Healthy() bool
	Close() error
	Acquire() error
	Release()
}

type Factory[K comparable, A Adapter] interface {
	New(K) (A, error)
}

type Pool[K comparable, A Adapter] interface {
	Acquire(key K) (A, error)
}

func New[K comparable, A Adapter](factory Factory[K, A]) Pool[K, A] {
	return &core[K, A]{pool: make(map[K][]A), factory: factory}
}

type core[K comparable, A Adapter] struct {
	mu      sync.RWMutex
	factory Factory[K, A]
	pool    map[K][]A
}

func (p *core[K, A]) Acquire(key K) (A, error) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if adapters, ok := p.pool[key]; ok {
		for _, adapter := range adapters {
			if adapter.Healthy() {
				return adapter, adapter.Acquire()
			}
		}
	}
	return p.new(key)
}

func (p *core[K, A]) new(key K) (a A, err error) {
	a, err = p.factory.New(key)
	if err != nil {
		return a, err
	}
	p.pool[key] = append(p.pool[key], a)
	return a, nil
}
