var Elector = require('../elector');

var role = 'standby';

var elector = Elector({
    server_info: {
        id: 0,
        ip: '127.0.0.1',
        port: 11111,
    }
});

elector.onRoleChange((_role)=>{
    role = _role;
    console.log(0, role);
});

setInterval(()=>{console.log(role)}, 2000);

