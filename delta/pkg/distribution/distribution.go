package distribution

import (
	"context"
	"github.com/arya-analytics/aspen"
	"github.com/arya-analytics/delta/pkg/distribution/channel"
	"github.com/arya-analytics/delta/pkg/distribution/core"
	"github.com/arya-analytics/delta/pkg/distribution/ontology"
	"github.com/arya-analytics/delta/pkg/distribution/segment"
	channeltransport "github.com/arya-analytics/delta/pkg/distribution/transport/grpc/channel"
	segmenttransport "github.com/arya-analytics/delta/pkg/distribution/transport/grpc/segment"
)

type (
	Config       = core.Config
	Core         = core.Core
	Node         = core.Node
	NodeID       = core.NodeID
	NodeState    = core.NodeState
	Cluster      = core.Cluster
	Resolver     = aspen.Resolver
	ClusterState = aspen.ClusterState
)

var DefaultConfig = core.DefaultConfig

type Distribution struct {
	Core
	Channel  *channel.Service
	Segment  *segment.Service
	Ontology *ontology.Ontology
}

// Close closes the distribution layer.
func (d Distribution) Close() error { return d.Storage.Close() }

// Open opens the distribution layer for the node using the provided Config. The caller is responsible for closing the
// distribution layer when it is no longer in use.
func Open(ctx context.Context, cfg Config) (d Distribution, err error) {
	d.Core, err = core.Open(ctx, cfg)
	if err != nil {
		return d, err
	}

	gorpDB := d.Storage.Gorpify()

	d.Ontology, err = ontology.Open(gorpDB)
	if err != nil {
		return d, err
	}

	channelTransport := channeltransport.New(cfg.Pool)
	segmentTransport := segmenttransport.New(cfg.Pool)
	*cfg.Transports = append(*cfg.Transports, channelTransport, segmentTransport)
	d.Channel = channel.New(d.Cluster, gorpDB, d.Storage.TS, channelTransport)
	d.Segment = segment.New(d.Channel, d.Storage.TS, segmentTransport, d.Cluster, cfg.Logger)

	return d, nil
}
