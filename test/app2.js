var Elector = require('../elector');

var role = 'standby';

var elector = Elector({
    server_info: {
        id: 1,
        ip: '127.0.0.1',
        port: 22222,
    }
});

elector.onRoleChange((_role)=>{
    role = _role;
    console.log(1, role);
});

setInterval(()=>{console.log(role)}, 2000);