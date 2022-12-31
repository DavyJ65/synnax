// Copyright 2022 Synnax Labs, Inc.
//
// Use of this software is governed by the Business Source License included in the file
// licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with the Business Source
// License, use of this software will be governed by the Apache License, Version 2.0,
// included in the file licenses/APL.txt.

package channel_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/synnaxlabs/synnax/pkg/distribution/channel"
	"github.com/synnaxlabs/synnax/pkg/distribution/core"
	"github.com/synnaxlabs/synnax/pkg/distribution/ontology"
	"github.com/synnaxlabs/synnax/pkg/storage"
)

var _ = Describe("Keys", func() {
	Describe("Keys", func() {
		Describe("New", func() {
			It("Should create a new key with the given node ID and cesium key", func() {
				k := channel.NewKey(core.NodeID(1), storage.ChannelKey(2))
				Expect(k.NodeID()).To(Equal(core.NodeID(1)))
				Expect(k.LocalKey()).To(Equal(storage.ChannelKey(2)))
			})
		})
		Describe("Lease", func() {
			It("Should return the leaseholder node ID", func() {
				k := channel.NewKey(core.NodeID(1), storage.ChannelKey(2))
				Expect(k.Lease()).To(Equal(k.NodeID()))
			})
		})
		Describe("Report", func() {
			It("Should return a string representation of the channels key", func() {
				k := channel.NewKey(core.NodeID(1), storage.ChannelKey(2))
				Expect(k.String()).To(Equal("1-2"))
			})
		})
		Describe("ParseKey", func() {
			It("Should parse the string representation of the channel's key", func() {
				k := channel.NewKey(core.NodeID(1), storage.ChannelKey(2))
				Expect(channel.ParseKey(k.String())).To(Equal(k))
			})
			DescribeTable("Should return an error for invalid keys", func(key string) {
				_, err := channel.ParseKey(key)
				Expect(err).To(HaveOccurred())
			},
				Entry("Invalid number of sections", "1-2-3"),
				Entry("Invalid cesium key", "1-"),
				Entry("Invalid node ID", "-2"),
			)
		})
		Describe("OntologyID", func() {
			It("Should return the ontology ID for the channel", func() {
				ok := channel.OntologyID(channel.NewKey(core.NodeID(1), storage.ChannelKey(2)))
				Expect(ok).To(Equal(ontology.ID{
					Type: "channel",
					Key:  "1-2",
				}))
			})
		})
	})
	Describe("Keys", func() {
		Describe("Report", func() {
			It("Should return a string representation of the keys", func() {
				keys := channel.Keys{
					channel.NewKey(core.NodeID(1), storage.ChannelKey(2)),
					channel.NewKey(core.NodeID(3), storage.ChannelKey(4)),
				}
				strings := keys.Strings()
				Expect(strings).To(Equal([]string{"1-2", "3-4"}))
			})
		})
		Describe("ParseKeys", func() {
			It("Should parse the string representation of the keys", func() {
				keys := channel.Keys{
					channel.NewKey(core.NodeID(1), storage.ChannelKey(2)),
					channel.NewKey(core.NodeID(3), storage.ChannelKey(4)),
				}
				parsedKeys, err := channel.ParseKeys(keys.Strings())
				Expect(err).To(BeNil())
				Expect(parsedKeys).To(Equal(keys))
			})
			It("Should return an error when a key is invalid", func() {
				_, err := channel.ParseKeys([]string{"1-2", "1-2-3"})
				Expect(err).To(HaveOccurred())
			})
		})
		Describe("TSChannel", func() {
			It("Should return an array of the cesium keys", func() {
				keys := channel.Keys{
					channel.NewKey(core.NodeID(1), storage.ChannelKey(2)),
					channel.NewKey(core.NodeID(3), storage.ChannelKey(4)),
				}
				s := keys.StorageKeys()
				Expect(s).To(Equal([]storage.ChannelKey{2, 4}))
			})
		})
		Describe("UniqueNodeIDs", func() {
			It("Should return a slice of the unique node ids for a set of keys", func() {
				ids := channel.Keys{
					channel.NewKey(core.NodeID(1), storage.ChannelKey(2)),
					channel.NewKey(core.NodeID(3), storage.ChannelKey(4)),
					channel.NewKey(core.NodeID(1), storage.ChannelKey(2)),
				}
				Expect(ids.UniqueNodeIDs()).To(Equal([]core.NodeID{1, 3}))
			})
		})
	})
})
