/**
 * Created by xuanxuan on 2017/5/22.
 */
$(function () {
    // 头图
    sendHeadPricture("diningMenu");
    var total_mount=0;
    var total=total = $(".shopCar_list ul li").length;;
    // 清空地址信息
    localStorage.setItem("address","undefined");
    // 获取之前选择的套餐
    var food = localStorage.getItem("food");
    $.ajax({
        url:localStorage.getItem("URL")+"/app/diningPackage/list",
        dataType:"json",
        type:"get",
        success: function (data) {
            // 默认显示第一个机构
            var newArray = data.response[0].menus;
             $(".organization span").html(data.response[0].organizationName+"<ul></ul>");
            // 添加机构
            $(data.response).each(function (index, ele) {
                var lis = document.createElement("li");
                $(lis).attr("id",ele.organizationId);
                $(lis).attr("index",index);
                $(lis).html(ele.organizationName);
                $(".organization ul").append(lis);
            });
            // 显示菜谱内容,只显示一个机构得
            function show(newArray, organ) {
                // 存储机构ID
                localStorage.setItem("organizationId",data.response[organ].organizationId);
                $(newArray).each(function (index, ele) {
                    var date =  ele.diningDateInStr;
                    var week = ele.diningDayOfWeek;
                    $(ele.packages).each(function (i, e) {
                        e.week = week;
                        e.date = date;
                    });
                });
                if(data.code==="0"){
                    // 默认显示周一得菜谱
                    $(".menu_box").html(template("taocan_list",newArray[0]));
                    $(".date_tab ul li").eq(0).find("a").addClass("on");
                    // 加载套餐得宽度
                    loadWidth();
                    // 为购物车注册点击事件
                    shopCar(newArray);
                    // 重新加载已经选择的套餐
                    reload(food);
                    $(".total").html("¥"+Number(localStorage.getItem("total_mount")));
                }

            }
            show(newArray,0);
            $(".organization").on("click", function () {
                if($(this).find("ul").css("display") == "none"){
                    $(this).find("ul").slideDown(500).children("li");
                }else {
                    $(this).find("ul").slideUp(500).children("li");
                }
                // 切换机构,切换机构后重新加载页面,套餐也要更新
                $(".organization li").on("click", function () {
                    console.log($(this).html());
                    if($(".shopCar_list ul li").length !== 0){
                        if(confirm("不能跨机构选择哦,是否切换机构")){
                            var array = data.response[Number($(this).attr("index"))].menus;
                            show(array, Number($(this).attr("index")));
                            $(".organization span").html($(this).html());
                            // 切换机构后,将购物车清空,总价也清空,并提醒同一时间只能再一个机构中下单
                            $(".shopCar_list ul li").remove();
                            total = 0;
                            $(".number").html("0");
                            $(".menu_box li ").find(".select_btn").attr("flag","true").find("img").attr("src", "../../img/zhucan/order/select_before.png");
                            $(".total").text(0);
                            total_mount =0;
                            localStorage.setItem("food","undefined");
                        }else {
                        }
                    }else {
                        var array = data.response[Number($(this).attr("index"))].menus;
                        show(array, Number($(this).attr("index")));
                        $(".organization span").html($(this).html());
                    }

                });
            });
        }
    });
    function shopCar(array) {
        var str="";
        // 购物车数量初始化
        $(".number").html(total);
        // tab 切换
        function menu_switch() {
            $(".date_tab ul li ").each(function (index, ele) {
                $(ele).on("click", function () {
                    //  样式切换
                    $(this).find("a").addClass("on");
                    $(this).siblings().find("a").removeClass("on");
                    // 下部菜单切换
                    $(".menu_box").html(template("taocan_list",array[index]));
                    loadWidth();
                    // 切换后依据购物车信息重新加载样式以及为购物车注册事件
                    reloadmenu();
                    addShop();
                    shopHandle();
                });
            }) ;
        }
        menu_switch();
        //点击添加到购物车
        function addShop() {
            $(".select_btn").on("click", function () {
                var name,price,week,date;
                var parent = $(this).parent().parent().parent();
                var taocan_flag = $(parent).attr("flag");
                if($(this).attr("flag")== "true"){
                    total = Number($(".number").text());
                    total++;
                    // 获取金额
                    total_mount = total_mount+Number($(parent).attr("price"));
                    $(".total").html("¥"+total_mount);
                    $(".number").html(total);
                    $(this).find("img").attr("src","../../img/zhucan/order/select_after.png");
                    $(this).attr("flag","false");
                    // 在购物车中添加
                    name = $(parent).attr("name");
                    price = $(parent).attr("price");
                    week = $(parent).attr("week");
                    date = $(parent).attr("date");
                    str = $(".shopCar_list ul").html();
                    str +='<li id="'+taocan_flag+'" name="'+name+'" price="'+price+'" week="'+week+'" date="'+date+'"> ' +
                        '<span class="taocan_name">'+date+'&nbsp;&nbsp;&nbsp;【'+name+'】</span>' +
                        ' <span class="taocan_price">¥ '+price+'</span> ' +
                        '<span class="delete"><img src="../../img/zhucan/order/deltet.png" alt=""></span> ' +
                        '</li>';
                    $(".shopCar_list ul").html(str);
                    shopHandle();
                }else {
                    total = Number($(".number").text());
                    total --;
                    $(".number").html(total);
                    total_mount = total_mount-Number($(parent).attr("price"));
                    $(".total").html("¥"+total_mount);
                    $(this).find("img").attr("src", "../../img/zhucan/order/select_before.png");
                    $(this).attr("flag", "true");
                    // 在购物车中减少
                    $(".shopCar_list ul li").each(function (index, ele) {
                        if($(ele).attr("id") == taocan_flag){
                            $(ele).remove();
                        }
                    });
                    shopHandle();
                }
                saveShopCar();
            });
        }
        addShop();
        // 购物车操作函数,删除套餐和清空购物册
        function shopHandle() {
            var food_id="";
            // 点击删除套餐
            $(".delete").on("click", function () {
                total_mount = total_mount - Number($(this).parent().attr("price"));
                $(".total").text(total_mount);
                food_id = $(this).parent().attr("id");
                $(".menu_box li").each(function (index, ele) {
                    if($(this).attr("flag") == food_id){
                        $(this).find(".select_btn").attr("flag","true").find("img").attr("src", "../../img/zhucan/order/select_before.png");
                    }
                })
                $(this).parent().remove();
                total--;
                $(".number").html(total);
            });
            // 清空购物车
            $("#clear").on("click", function () {
                $(".shopCar_list ul li").remove();
                total = 0;
                $(".number").html("0");
                $(".menu_box li ").find(".select_btn").attr("flag","true").find("img").attr("src", "../../img/zhucan/order/select_before.png");
                $(".total").text(0);
                total_mount =0;
            });
            saveShopCar();
        }
        shopHandle();
        // 点击购物车切换显示
        $("#car").on("click", function () {
            if($(this).attr("flag") == "true"){
                $(this).attr("flag", "false");
                $(".shopCar_list").css("display", "block");
            }else {
                $(this).attr("flag", "true");
                $(".shopCar_list").css("display", "none");
            }
        });
        // 购物车更改后重新加载套餐显示得样式
        function reloadmenu() {
            var array = $(".shopCar_list ul li");
            $(".menu_box li").each(function (index, ele) {
                $(array).each(function (i, e) {
                    if($(ele).attr("flag") == e.id){
                        $(ele).find(".food_box .menu_select .select_btn img").attr("src","../../img/zhucan/order/select_after.png");
                        $(ele).find(".food_box .menu_select .select_btn").attr("flag","false");
                    }
                });
            });
        }
        // 获取购物车信息 并存储到localStorage中
        function saveShopCar() {
            var array = new Array();
            for(var i=0,length =$(".shopCar_list ul li").length;i<length;i++){
                array[i]={};
            }
            $(".shopCar_list ul li").each(function (index, ele) {
                array[index].name = $(ele).attr("name");
                array[index].id = $(ele).attr("id");
                array[index].week = $(ele).attr("week");
                array[index].price = $(ele).attr("price");
                array[index].date = $(ele).attr("date");
            });
            localStorage.setItem("food",JSON.stringify(array));
            localStorage.setItem("total_mount",$(".total").html().split("").splice(1).join(""));
        }
    }
    // 页面初始化,访问本地存储,显示已选套餐加载购物车
    function reload(food) {
        var str ="";
        if(food !==[]&& food !=="undefined"){
            food = JSON.parse(food);
            // 套餐初始化
            $(".menu_box li").each(function (index, ele) {
                $(food).each(function (i, e) {
                    if($(e).attr("id") == $(ele).attr("flag")){
                        $(ele).find(".select_btn img").attr("src","../../img/zhucan/order/select_after.png");
                        $(ele).find(".select_btn").attr("flag","false");
                    }
                });
            });
            // 购物车初始化
            $(food).each(function (index, ele) {
                str +='<li id="'+ele.id+'" name="'+ele.name+'" price="'+ele.price+'" week="'+ele.week+'" date="'+ele.date+'"> ' +
                    '<span class="taocan_name">'+ele.time+'&nbsp;&nbsp;&nbsp;【'+ele.name+'】</span>' +
                    ' <span class="taocan_price">¥ '+ele.price+'</span> ' +
                    '<span class="delete"><img src="../../img/zhucan/order/deltet.png" alt=""></span> ' +
                    '</li>';
                total_mount += Number(ele.price);
            });
            $(".shopCar_list ul").html(str);
            $(".number").html(Number(food.length));
            $(".total").html("¥"+total_mount);
        }
    }
    function loadWidth() {
        $(".menu_box li ul").each(function () {
            $(this).width($(this).find("li").length*305);
        });
    }


});