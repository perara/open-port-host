const net = require('net');

const Promise = require('bluebird');

const tryServer = options => new Promise((resolve, reject) => {
  const server = net.createServer();
  server.on('error', reject);
  server.listen(options, () => resolve(options.port));
});

const find = options => new Promise((resolve, reject) => {
  const {start, end, host} = options;

  let promises = [];
  let port = start;

  const halt = port => {
    promises = [];
    resolve(port);
  };

  const fire = () => {
    if (promises.length > 0) {
      const nextPromise = promises.shift();
      Promise.resolve(nextPromise)
        .then(halt).catch(fire);
    } else {
      reject(`No port found in range ${start} - ${end}`);
    }
  };

  while (port < end) {
    promises.push(tryServer({port, host}));
    port += 1;
  }

  fire();
});

module.exports = {
  find
};

const options = {
  start: 8000,
  end: 8003,
  host: 'localhost'
};

find(options).then(console.log);