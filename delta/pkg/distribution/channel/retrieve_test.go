package channel_test

import (
	"github.com/arya-analytics/aspen"
	"github.com/arya-analytics/delta/pkg/distribution/channel"
	"github.com/arya-analytics/delta/pkg/distribution/core/mock"
	"github.com/arya-analytics/x/telem"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"go.uber.org/zap"
	"time"
)

var _ = Describe("getAttributes", Ordered, func() {
	var (
		services map[aspen.NodeID]*channel.Service
		builder  *mock.CoreBuilder
		log      *zap.Logger
	)
	BeforeAll(func() {
		log = zap.NewNop()
		builder, services = provisionServices(log)
	})
	AfterAll(func() {
		Expect(builder.Close()).To(Succeed())
		Expect(builder.Cleanup()).To(Succeed())
	})
	Describe("Retrieve", func() {

		It("Should correctly retrieve a set of channels", func() {
			created, err := services[1].NewCreate().
				WithName("SG02").
				WithDataRate(25*telem.KHz).
				WithDataType(telem.Float32).
				WithNodeID(1).
				ExecN(ctx, 10)
			Expect(err).ToNot(HaveOccurred())

			var resChannels []channel.Channel

			err = services[1].
				NewRetrieve().
				WhereNodeID(1).
				Entries(&resChannels).
				Exec(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(resChannels).To(HaveLen(len(created)))

			// Wait for the operations to propagate to another node.
			time.Sleep(60 * time.Millisecond)

			var resChannelsTwo []channel.Channel

			err = services[2].
				NewRetrieve().
				WhereNodeID(1).
				Entries(&resChannelsTwo).
				Exec(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(resChannelsTwo).To(HaveLen(len(created)))
		})
		It("Should correctly retrieve a channel by its key", func() {
			created, err := services[1].NewCreate().
				WithName("SG02").
				WithDataRate(25*telem.KHz).
				WithDataType(telem.Float32).
				WithNodeID(1).
				ExecN(ctx, 10)
			Expect(err).ToNot(HaveOccurred())

			var resChannels []channel.Channel

			err = services[1].
				NewRetrieve().
				WhereKeys(created[0].Key()).
				Entries(&resChannels).
				Exec(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(resChannels).To(HaveLen(1))
			Expect(resChannels[0].Key()).To(Equal(created[0].Key()))
		})
	})
	Describe("Exists", func() {
		It("Should return true if a channel exists", func() {
			_, err := services[1].NewCreate().
				WithName("SG02").
				WithDataRate(25*telem.KHz).
				WithDataType(telem.Float32).
				WithNodeID(1).
				ExecN(ctx, 10)
			Expect(err).ToNot(HaveOccurred())

			key, err := channel.ParseKey("1-21")
			Expect(err).ToNot(HaveOccurred())

			exists, err := services[1].
				NewRetrieve().
				WhereKeys(key).
				Exists(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(exists).To(BeTrue())
		})
	})
})
