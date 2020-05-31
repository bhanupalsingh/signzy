var socket = require("socket.io-client")("http://localhost:3000");
var user = undefined;
const repl = require("repl");
const { exec } = require("child_process");
const nodersa = require("node-rsa");
var fs = require("fs");

socket.on("connect", () => {
     user = process.argv[2];
});

socket.on("disconnect", function () {
     socket.emit("disconnect");
});

socket.on("message", (data, callBack) => {
     data = decryption(data);
     let { cmd, user, isLinuxCommand } = JSON.parse(data);
     if (isLinuxCommand) {
          cmd = cmd.substring(1, cmd.length - 2);

          exec(cmd, (err, stdout, stderr) => {
               if (err) {
                    console.error("err", err);
               } else {
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
               }
          });
     } else {
          console.log(user + ": " + cmd);
          //console.log(callBack);
     }
});

repl.start({
     eval: (cmd) => {
          let isLinuxCommand = false;
          if (cmd.startsWith("`")) {
               isLinuxCommand = true;
          }
          let encrypted = encryption({ cmd, user, isLinuxCommand });
          socket.send(encrypted);
     },
});

socket.on("ack", function (data) {
     console.log("ack");
});

function encryption(data) {
     //const absolutePath = Assets.absoluteFilePath( "public.key" ); //public key file path
     const publicKey = fs.readFileSync("./sample-public.pem", "utf8");
     const key = new nodersa(publicKey);
     const encrypted = key.encrypt(data, "base64");
     return encrypted;
}

function decryption(data) {
     const privateKey = fs.readFileSync("./sample-private.pem", "utf8");
     const key = new nodersa(privateKey).decrypt(data, "utf8");
     return key;
}
