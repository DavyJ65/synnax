<br/>
<p align="center">
    <a href="https://synnaxlabs.com/">
        <img src="docs/media/logo/title-white.svg" width="40%"/>
    </a>
</p>

# Synnax

The telemetry engine for operating large scale hardware systems with ease.

* [What is Synnax?](#what-is-synnax)
* [Get Started](https://docs.synnaxlabs.com) 
* [Architecture Concepts](https://docs.synnaxlabs.com/concepts)
* [New Developer Guide](https://docs.synnaxlabs.com/category/developers)
* [Technical RFCs](https://docs.synnaxlabs.com/category/technical-rfcs)

# What is Synnax?

Synnax is a distributed telemetry engine designed to acquire and store telemetry 
from, issue commands to, and process data generated by hardware systems. It scales 
horizontally, and can be deployed on edge devices (data acquisiton) in
highly dynamic environments with intermittent network connectivity, or in cloud
environments (data processing) for high performance analyis.

# Repository Organization

Synnax is built as a collection of several different projects, all of which are collected
in this monorepo. The following is a list of the services and their purpose:

* [Aspen](https://github.com/synnaxlabs/synnax/tree/main/aspen) - A gossip based
distributed key-value store used for propagating and persisting metadata between
nodes, such cluster topology, state, and configuration. The core RFC for Aspen 
is available [here](https://docs.synnaxlabs.com/rfc/2-220518-aspen-distributed-storage). 
* [Cesium](https://github.com/synnaxlabs/synnax/tree/main/cesium) - An embedded
time-series engine optimized for high performance reads and writes of regular telemetry. The
core RFC for Cesium is available [here](https://docs.synnaxlabs.com/rfc/1-220517-cesium-segment-storage).
* [Client](https://github.com/synnaxlabs/synnax/tree/main/client) - Client libraries
for synnax available in multiple languages. The implementation for each language
is a subpackage of the client package.
* [Documentation](https://github.com/synnaxlabs/synnax/tree/main/docs) - The technical
and user-facing documentation for Synnax. Contains the code for the Synnax documentation
website, technical RFCs, and additonal media such as logos.
* [Freighter](https://github.com/synnaxlabs/synnax/tree/main/freighter) - A protocol
agnostic network transport for cross-language unary and streaming communication. Freighter
has implementations in several languages; each implementation is container in a
sub-directory of the freighter service. The core RFC for Freighter is available [here](https://docs.synnaxlabs.com/rfc/6-220809-freighter).
* [Pluto](https://github.com/synnaxlabs/synnax/tree/main/pluto) - A React component
library for building the Synnax user interfaces. This package includes theming
standards (primary colors, grays, errors, fonts, etc.).
* [Synnax](https://github.com/synnaxlabs/synnax/tree/main/synnax) - The core Synnax
server, which integrates all other services to provide a complete telemetry system.
* [X](https://github.com/synnaxlabs/synnax/tree/main/x) - The common utilities
used across all Synnax services. To list a few interesting examples:
  * [Alamos](https://github.com/synnaxlabs/synnax/tree/main/x/alamos) - Dependency
  injected code instrumentation.
  * [Confluence](https://github.com/synnaxlabs/synnax/tree/main/x/confluence) - 
  Assemble and run concurrent data processing and message passing pipelines.
  * [Gorp](https://github.com/synnaxlabs/synnax/tree/main/x/gorp) - Efficent
    querying of go-types to and from a key-value store.
  * [Signal](https://github.com/synnaxlabs/synnax/tree/main/x/signal) - A library
    for controlling the lifecycle of communicating sequential processes.
  
  

