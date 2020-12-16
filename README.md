# chessmultiplayer ![Dependency Status][daviddm-image]

> A multiplayer command line chess game.

[Demo](demo.mp4)

## Installation

```sh
$ git clone https://github.com/elimerl/chesscli
$ cd chesscli
$ yarn install
$ tsc
```

## Usage

Running the client:

```sh
$ node dist/client.js
```

The server:

```sh
$ node dist/server.js
```

For configuration edit `client.yml` and `server.yml`.
Example configs:
`client.yml`:

```yml
---
host: http://localhost:3000
```

`server.yml`:

```yml
---
port: 3000
```

## Contributing

Found a bug? Want a feature? Make an [issue](https://github.com/elimerl/chesscli/issues) and/or [a pull request](https://github.com/elimerl/chesscli/pulls).

## License

GPL-3.0 © [elimerl](https://github.com/elimerl)

[daviddm-image]: https://status.david-dm.org/gh/elimerl/chesscli.svg?theme=shields.io
