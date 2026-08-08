module.exports = {
  apps: [{
    name: "nex_card",
    cwd: "/var/www/nex_card",
    script: "node_modules/.bin/next",
    args: "start -p 3000",
    env: {
      NODE_ENV: "production",
    },
  }],
};
