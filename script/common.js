/**
 * Created by xuanxuan on 2017/5/19.
 */

/*
*   发送接口,将数据渲染到页面得对应位置
*   参数一: url
*   参数二: 请求方式  get、post
*   参数三: 请求参数
*   参数四: 渲染位置
*   参数五: 模版ID
* */
function send(url, method, parameter, element, templateId) {
    $.ajax({
        url:url,
        dataType:"json",
        type:method,
        data:parameter,
        success: function (data) {
            var str = $(element).html();
            if(data.code =="1"){
                console.log(data);
                $(element).html(str + template(templateId, data));
            }else {
                console.log(data.message);
            }
        }
    });
}
/**
 * 发送登录并存储token
 * @param fn
 */
function sendLogin(fn) {
    $.ajax({
        url:localStorage.getItem("URL")+"/app/auth/login",
        dataType:"json",
        data:{},
        type:"post",
        headers:{
            // "Content-Type":"application/json"
        },
        data:{
          "idNo":"12345678"
        },
        success: function (data) {
            console.log(data);
            // 存储token
            if(data.code === "0"){
                localStorage.setItem("token",data.response);
                if(fn !== undefined){ fn();}

            }else {
                alert(data.message);
            }
        }
    });
}
/**
 * 返回上一步
 * 参数一: 操作对象  类名,ID名,标签名
 */
function back(element) {
    $(element).on("click", function () {
        window.history.back(-1);
    });
}
/**
 * 调用头部图片接口
 * @param page
 */
function sendHeadPricture(page) {
    $.ajax({
        url:localStorage.getItem("URL")+"/app/topPicture/getPicture",
        data:{
           pageName:page
        },
        dataType:"json",
        type:"get",
        success: function (data) {
            if(data.code ==="0"){
                // fn();
                // 替换图片
                $("header img").attr("src",data.response[0].imageUrl);
            }
        }
    });
}
