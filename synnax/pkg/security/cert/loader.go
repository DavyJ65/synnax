package cert

import (
	"crypto"
	"crypto/tls"
	"crypto/x509"
	"github.com/cockroachdb/errors"
	"github.com/synnaxlabs/x/config"
	xfs "github.com/synnaxlabs/x/io/fs"
	"github.com/synnaxlabs/x/override"
	"github.com/synnaxlabs/x/validate"
	"go.uber.org/zap"
	"io"
	"io/fs"
	"os"
)

type LoaderConfig struct {
	// CertsDir is the directory where the certificates are stored.
	CertsDir string
	// CAKeyPath is the path to the CA private key. This is relative to CertsDir.
	CAKeyPath string
	// CACertPath is the path to the CA certificate. This is relative to CertsDir.
	CACertPath string
	// NodeKeyPath is the path to the node private key. This is relative to CertsDir.
	NodeKeyPath string
	// NodeCertPath is the path to the node certificate. This is relative to CertsDir.
	NodeCertPath string
	// FS is the filesystem to use.
	FS xfs.FS
	// Logger is the witness of it all.
	Logger *zap.SugaredLogger
}

var (
	_                   config.Config[LoaderConfig] = LoaderConfig{}
	DefaultLoaderConfig                             = LoaderConfig{
		CertsDir:     "./certs",
		CAKeyPath:    "ca.key",
		CACertPath:   "ca.crt",
		NodeKeyPath:  "node.key",
		NodeCertPath: "node.crt",
		FS:           xfs.Default,
	}
)

// Override implements Config.
func (l LoaderConfig) Override(other LoaderConfig) LoaderConfig {
	l.CertsDir = override.String(l.CertsDir, other.CertsDir)
	l.CAKeyPath = override.String(l.CAKeyPath, other.CAKeyPath)
	l.CACertPath = override.String(l.CACertPath, other.CACertPath)
	l.NodeKeyPath = override.String(l.NodeKeyPath, other.NodeKeyPath)
	l.NodeCertPath = override.String(l.NodeCertPath, other.NodeCertPath)
	l.FS = override.Nil(l.FS, other.FS)
	l.Logger = override.Nil(l.Logger, other.Logger)
	return l
}

// Validate implements Config.
func (l LoaderConfig) Validate() error {
	v := validate.New("cert.Loader")
	validate.NotEmptyString(v, "CertsDir", l.CertsDir)
	validate.NotEmptyString(v, "CAKeyPath", l.CAKeyPath)
	validate.NotEmptyString(v, "CACertPath", l.CACertPath)
	validate.NotEmptyString(v, "NodeKeyPath", l.NodeKeyPath)
	validate.NotEmptyString(v, "NodeCertPath", l.NodeCertPath)
	validate.NotNil(v, "FS", l.FS)
	validate.NotNil(v, "Logger", l.Logger)
	return v.Error()
}

// Loader is a certificate Loader.
type Loader struct {
	LoaderConfig
}

func NewLoader(configs ...LoaderConfig) (*Loader, error) {
	cfg, err := config.OverrideAndValidate(DefaultLoaderConfig, configs...)
	if err != nil {
		return nil, err
	}
	cfg.FS, err = cfg.FS.Sub(cfg.CertsDir)
	return &Loader{LoaderConfig: cfg}, err
}

// LoadCACertAndKey loads the CA certificate and its private key. If multiple
// certificates are found in the CA certificate file, the first one is used.
func (l *Loader) LoadCACertAndKey() (c *x509.Certificate, k crypto.PrivateKey, err error) {
	c, k, err = l.loadX509(l.CACertPath, l.CAKeyPath)
	if errors.Is(err, fs.ErrNotExist) {
		err = errors.Wrapf(err, "CA certificate not found")
	}
	return
}

func (l *Loader) LoadNodeCertAndKey() (c *x509.Certificate, k crypto.PrivateKey, err error) {
	c, k, err = l.loadX509(l.NodeCertPath, l.NodeKeyPath)
	if errors.Is(err, fs.ErrNotExist) {
		err = errors.Wrapf(err, "node certificate not found")
	}
	return
}

func (l *Loader) LoadNodeTLSCertAndKey() (c *tls.Certificate, err error) {
	c, err = l.loadTLS(l.NodeCertPath, l.NodeKeyPath)
	if errors.Is(err, fs.ErrNotExist) {
		err = errors.Wrapf(err, "node certificate not found")
	}
	return
}

func (l *Loader) loadX509(certPath, keyPath string) (*x509.Certificate, crypto.PrivateKey, error) {
	c, err := l.loadTLS(certPath, keyPath)
	certParsed, err := x509.ParseCertificate(c.Certificate[0])
	if err != nil {
		return nil, nil, err
	}
	return certParsed, c.PrivateKey, nil
}

func (l *Loader) loadTLS(certPath, keyPath string) (*tls.Certificate, error) {
	certPEM, err := l.readAll(certPath)
	if err != nil {
		return nil, err
	}
	keyPEM, err := l.readAll(keyPath)
	if err != nil {
		return nil, err
	}
	c, err := tls.X509KeyPair(certPEM, keyPEM)
	if err != nil {
		return nil, err
	}
	return &c, err
}

func (l *Loader) readAll(path string) ([]byte, error) {
	f, err := l.FS.Open(path, os.O_RDONLY)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := f.Close(); err != nil {
			l.Logger.Warnf("failed to close file: %v", err)
		}
	}()
	return io.ReadAll(f)
}
