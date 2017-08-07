var ZooKeeper = require ("zookeeper");

module.exports = zk;

function zk(connect_str){
    var zk = new ZooKeeper({
        connect: connect_str || "localhost:2181",
        timeout: 5000,
        debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false,
        data_as_buffer: false,
    });

    return {
        connect: connect,
        mkdirp: mkdirp,
        create: create,
        wget: wget,
        zk: zk,
    }

    function connect(){
        return new Promise((resolve, reject) => {
            zk.connect((err) => {
                if(err) return reject(err);
                return resolve();
            });
        });
    }

    function mkdirp(path){
        return new Promise((resolve, reject) => {
            zk.mkdirp(path, (err) => {
                if(err) return reject(err);
                return resolve();
            });
        });
    }

    function create(path, data, flags){
        return new Promise((resolve, reject) => {
            zk.a_create(path, data, flags, (rc, error, path) => {
                if(rc !== 0 ) return reject(error);
                return resolve(path);
            })
        });
    }

    function wget(path, watch){
        return new Promise((resolve, reject) => {
            zk.aw_get(path, watch, (rc, error, stat, data) => {
                if(rc !== 0 ) return reject(error);
                return resolve(data);
            });
        });
    }

}