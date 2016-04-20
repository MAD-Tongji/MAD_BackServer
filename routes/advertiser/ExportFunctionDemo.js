/**
 * Created by Administrator on 2016/4/20.
 */


function a(){
    console.log('a');//logic
}
function b(callback) {
    console.log('b');//logic
    callback();//callback with no parms
    //or callback(parm1,parm2,......)
}

exports.a = a;//export
exports.b = b;//export