package lineplot_test

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"github.com/synnaxlabs/synnax/pkg/workspace/pid"
)

var _ = Describe("Retrieve", func() {
	It("Should retrieve a LinePlot", func() {
		p := pid.PID{Name: "test", Data: "data"}
		Expect(svc.NewWriter(tx).Create(ctx, ws.Key, &p)).To(Succeed())
		var res pid.PID
		Expect(svc.NewRetrieve().WhereKeys(p.Key).Entry(&res).Exec(ctx, tx)).To(Succeed())
		Expect(res).To(Equal(p))
	})
})
