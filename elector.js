var ZK = require('./zk.js');
var ZooKeeper = require ("zookeeper");
var EventEmitter = require('events');
var uuidv4 = require('uuid/v4')

var _lock_path = '/nodes/leader';

module.exports = elector;

function elector({lock_path, zk_connect, server_info}){
    var lock_path = lock_path || _lock_path;
    var tmp = lock_path.split('/');
    var root_path = tmp.splice(0, tmp.length-1).join('/');

    var server_info = server_info || {};
    server_info.id = server_info.id ? server_info.id : uuid()
    var zk_connect = zk_connect || "localhost:2181";
    var role = 'standby'; //default
    var e = new EventEmitter();

    var zk = ZK(zk_connect);
    zk.connect()
    .then(() => {
        console.log('connected');
        return zk.mkdirp(root_path);
    })
    .then(() => {
        console.log('mkdirp succ');
        return zk.create(lock_path, JSON.stringify(server_info), ZooKeeper.ZOO_EPHEMERAL)
        .then(() => {
            console.log('create succ');
            setRole('active');
        })
        .catch(err => {
            console.log('create fail', err);
            setRole('standby');
            check(lock_path);
        });
    })
    .catch(err => {
        console.log('connect error', err); 
    });

    function check(path){
        zk.wget(path, watch)
        .then(data => {
            console.log('check wget succ', data);
            data = JSON.parse(data);
            if(data.id !== server_info.id){
                setRole('standby');
            }else{
                setRole('active');
            }
        })
        .catch(err => {
            console.log('check wget error', err);
            if(err == 'no node'){
                zk.create(path, JSON.stringify(server_info), ZooKeeper.ZOO_EPHEMERAL)
                .then(() => {
                    console.log('check create succ');
                    setRole('active');                    
                })
                .catch(err => {
                    console.log('check create fail', err);
                    setRole('standby');
                    check(path);
                });
            }
        });
    }

    function watch(type, state, path){
        console.log('watch', type, state, path);
        if(path) check(path);
    }

    function setRole(new_role){
        if(role === new_role) return;
        role = new_role;
        e.emit('change', role);
    }

    return {
        getRole : function(){
            return role;
        },
        onRoleChange : function(func){
            e.on('change', func);
        },
    }

}

function uuid(){
    return uuidv4();
}
