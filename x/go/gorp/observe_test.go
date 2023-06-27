package gorp_test

import (
	"context"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/synnaxlabs/x/change"
	"github.com/synnaxlabs/x/gorp"
	"github.com/synnaxlabs/x/kv"
	"github.com/synnaxlabs/x/kv/memkv"
)

var _ = Describe("Observe", Ordered, func() {
	var (
		db   *gorp.DB
		kvDB kv.DB
	)
	BeforeEach(func() {
		kvDB = memkv.New()
		db = gorp.Wrap(kvDB)
	})
	AfterEach(func() { Expect(kvDB.Close()).To(Succeed()) })
	It("Should correctly observe a change to the key value store", func() {
		tx := db.OpenTx()
		Expect(gorp.NewCreate[int, entry]().Entry(&entry{ID: 42, Data: "data"}).Exec(ctx, tx)).To(Succeed())
		called := false
		gorp.Observe[int, entry](db).OnChange(func(ctx context.Context, reader gorp.TxReader[int, entry]) {
			ch, ok, err := reader.Next(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(ok).To(BeTrue())
			Expect(ch.Value).To(Equal(entry{ID: 42, Data: "data"}))
			Expect(ch.Variant).To(Equal(change.Set))
			called = true
			ch, ok, err = reader.Next(ctx)
			Expect(err).ToNot(HaveOccurred())
			Expect(ok).To(BeFalse())
		})
		Expect(tx.Commit(ctx)).To(Succeed())
		Expect(called).To(BeTrue())
	})
	It("Should only notify for the type of the entries written", func() {
		tx := db.OpenTx()
		Expect(gorp.NewCreate[int, entry]().Entry(&entry{ID: 42, Data: "data"}).Exec(ctx, tx)).To(Succeed())
		called := false
		gorp.Observe[int, entryTwo](db).OnChange(func(ctx context.Context, reader gorp.TxReader[int, entryTwo]) {
			called = true
			_, ok, _ := reader.Next(ctx)
			Expect(ok).To(BeFalse())
		})
		Expect(tx.Commit(ctx)).To(Succeed())
		Expect(called).To(BeTrue())
	})
})
