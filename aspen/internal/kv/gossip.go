// Copyright 2023 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package kv

import (
	"context"
	"go/types"

	"github.com/synnaxlabs/aspen/internal/cluster/gossip"
	"github.com/synnaxlabs/aspen/internal/node"
	"github.com/synnaxlabs/freighter"
	"github.com/synnaxlabs/x/confluence"
	"go.uber.org/zap"
)

type (
	BatchTransportClient = freighter.UnaryClient[TxRequest, TxRequest]
	BatchTransportServer = freighter.UnaryServer[TxRequest, TxRequest]
)

type operationSender struct {
	Config
	confluence.LinearTransform[TxRequest, TxRequest]
}

func newOperationSender(cfg Config) segment {
	os := &operationSender{Config: cfg}
	os.Transform = os.send
	return os
}

func (g *operationSender) send(_ context.Context, sync TxRequest) (TxRequest, bool, error) {
	// If we have no NewReader to propagate, it's best to avoid the network chatter.
	if sync.empty() {
		return sync, false, nil
	}
	hostID := g.Cluster.HostKey()
	peer := gossip.RandomPeer(g.Cluster.Nodes(), hostID)
	if peer.Address == "" {
		return sync, false, nil
	}
	sync.Sender = hostID
	ack, err := g.BatchTransportClient.Send(sync.Context, peer.Address, sync)
	ack.Context = sync.Context
	if err != nil {
		g.L.Error("operation gossip failed", zap.Error(err))
	}
	// If we have no operations to apply, avoid the pipeline overhead.
	return ack, !ack.empty(), nil
}

type operationReceiver struct {
	Config
	store store
	confluence.AbstractUnarySource[TxRequest]
	confluence.NopFlow
}

func newOperationReceiver(cfg Config, s store) source {
	or := &operationReceiver{Config: cfg, store: s}
	or.BatchTransportServer.BindHandler(or.handle)
	return or
}

func (g *operationReceiver) handle(ctx context.Context, req TxRequest) (TxRequest, error) {
	// The handler context is cancelled after it returns, so we need to use a separate
	// context for executing the tx.
	req.Context = context.TODO()
	select {
	case <-ctx.Done():
		return TxRequest{}, ctx.Err()
	case g.Out.Inlet() <- req:
	}
	br := g.store.PeekState().toBatchRequest(ctx)
	br.Sender = g.Cluster.HostKey()
	return br, nil
}

type FeedbackMessage struct {
	Sender  node.Key
	Digests Digests
}

type (
	FeedbackTransportClient = freighter.UnaryClient[FeedbackMessage, types.Nil]
	FeedbackTransportServer = freighter.UnaryServer[FeedbackMessage, types.Nil]
)

type feedbackSender struct {
	Config
	confluence.UnarySink[TxRequest]
}

func newFeedbackSender(cfg Config) sink {
	fs := &feedbackSender{Config: cfg}
	fs.Sink = fs.send
	return fs
}

func (f *feedbackSender) send(ctx context.Context, bd TxRequest) error {
	msg := FeedbackMessage{Sender: f.Cluster.Host().Key, Digests: bd.digests()}
	sender, _ := f.Cluster.Node(bd.Sender)
	if _, err := f.FeedbackTransportClient.Send(ctx, sender.Address, msg); err != nil {
		f.L.Error("feedback gossip failed", zap.Error(err))
	}
	return nil
}

type feedbackReceiver struct {
	Config
	confluence.AbstractUnarySource[TxRequest]
	confluence.NopFlow
}

func newFeedbackReceiver(cfg Config) source {
	fr := &feedbackReceiver{Config: cfg}
	fr.FeedbackTransportServer.BindHandler(fr.handle)
	return fr
}

func (f *feedbackReceiver) handle(_ context.Context, msg FeedbackMessage) (types.Nil, error) {
	// The handler context is cancelled after it returns, so we need to use a separate
	// context for passing the feedback to the pipeline.
	f.Out.Inlet() <- msg.Digests.toRequest(context.TODO())
	return types.Nil{}, nil
}
