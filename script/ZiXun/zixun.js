/**
 * Created by xuanxuan on 2017/5/18.
 */

$(function () {
    // 调用头图接口
    sendHeadPricture("news");
    // 获取资讯标志,判断显示新闻还是活动
    var zixun_flag = localStorage.getItem("zixun_flag");
    localStorage.setItem("zixun_flag",true);
    var lastPage = false;
    var page = 0;
    if(zixun_flag == "true"){
        $(".content_bottom_tab a").eq(0).find("span").css("display","inline-block");
        $(".content_bottom_tab a").eq(1).find("span").css("display","none");
        $("#zixun_items").css("display","block");
        $("#huodong_items").css("display","none");
        // send('http://zixun_list','get',{},'.zixun_items','zixun_list');
        sendAjax(localStorage.getItem("URL")+"/app/news/listByPage","get",{type:"news",page:0,size:10},".zixun_items","zixun_list");
    }else {
        $(".content_bottom_tab a").eq(1).find("span").css("display","inline-block");
        $(".content_bottom_tab a").eq(0).find("span").css("display","none");
        $("#zixun_items").css("display","none");
        $("#huodong_items").css("display","block");
        // send("http://huodong_list","get",{},".huodong_items","huodong_list");
        sendAjax(localStorage.getItem("URL")+"/app/news/listByPage","get",{type:"fun",page:0,size:10},".huodong_items","huodong_list");
    }

    // 切换政策新闻和活动,调取相应接口
    $("#zixun_btn,#huodong_btn").on("click", function () {
        if($(this).attr('id')=="zixun_btn"){
            $("#zixun_items").css("display","block");
            $("#huodong_items").css("display","none");
            sendAjax(localStorage.getItem("URL")+"/app/news/listByPage","get",{type:"news",page:0,size:10},".zixun_items","zixun_list");
        }else {
            $("#zixun_items").css("display","none");
            $("#huodong_items").css("display","block");
            sendAjax(localStorage.getItem("URL")+"/app/news/listByPage","get",{type:"fun",page:0,size:10},".huodong_items","huodong_list");
        }
        $(this).find("span").css("display","inline-block");
        $(this).siblings().find("span").css("display","none");
    });
    function sendAjax(url, method, parameter, element, templateId) {
        $.ajax({
            url:url,
            dataType:"json",
            type:method,
            data:parameter,
            success: function (data) {
                if(data.code =="0"){
                    if(data.response.content.length == 0){
                        alert("当前还没有资讯哦");
                    }else {
                        $(element).html(template(templateId, data.response));
                        page = data.response.number;
                        lastPage = data.response.last;
                    }
                }else {
                    alert(data.message);
                }
            }
        })
    }
    $(".add").on("click", function () {
        if(lastPage){
            if($(".zixun_items").css("display") !=="none"){
                // send('http://zixun_list','get',{},'.zixun_items','zixun_list');
                $.ajax({
                    url:localStorage.getItem("URL")+"/app/news/listByPage",
                    dataType:"json",
                    type:"get",
                    data:{type:"news",page:page+1,size:10},
                    success: function (data) {
                        if(data.code =="0"){
                            if(data.response.content.length == 0){
                                alert("当前还没有资讯哦");
                            }else {
                                var  str =  $(".zixun_items").html();
                                $(".zixun_items").html(str+template("zixun_list", data.response));
                                page = data.response.number;
                                lastPage = data.response.last;
                            }
                        }else {
                            alert(data.message);
                        }
                    }
                });
            }else {
                // send("http://huodong_list","get",{},".huodong_items","huodong_list");
                $.ajax({
                    url:localStorage.getItem("URL")+"/app/news/listByPage",
                    dataType:"json",
                    type:"get",
                    data:{type:"fun",page:page+1,size:10},
                    success: function (data) {
                        if(data.code =="0"){
                            if(data.response.content.length == 0){
                                alert("当前还没有资讯哦");
                            }else {
                                var  str =  $(".huodong_items").html();
                                $(".huodong_items").html(str+template("huodong_list", data.response));
                                page = data.response.number;
                                lastPage = data.response.last;
                            }
                        }else {
                            alert(data.message);
                        }
                    }
                })
            }
        }else {
            $(this).html("当前已是最后一页");
        }

    });
});