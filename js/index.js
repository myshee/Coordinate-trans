"use script"; //开发环境建议开启严格模式

//判断webgl支持
if (!mars3d.Util.webglreport()) {
  mars3d.Util.webglerror();
}

//读取 config.json 配置文件
let configUrl = 'config/config.json'
fetch(configUrl)
  .then(function (response) {
    if (!response.ok) {
      var error = new Error(response.statusText)
      error.response = response
      throw error
    } else {
      return response.json()
    }
  })
  .then((json) => {
    initMap(json.map3d); //构建地图 
  })
  .catch(function (error) {
    console.log('加载JSON出错', error) 
    haoutil.alert(error?.message, '出错了')
  })

var map;

function initMap(mapOptions) {
  //创建三维地球场景
  map = new mars3d.Map("mars3dContainer", mapOptions);

  //以下为演示代码
  var jd = 0
  var wd = 0
  var height = 0
  var param = haoutil.system.getRequest()

  if (param && param.view == 'false') {
    $('#info').hide()
  }

  if (param && param.x && param.y) {
    jd = Number(param.x)
    wd = Number(param.y)
    height = Number(param.z || 0)

    if (jd > 180) {
      jd = jd % 180
    }
    if (wd > 90) {
      wd = wd % 90
    }

    $('#point_jd').val(jd)
    $('#point_wd').val(wd)
    $('#point_height').val(height)
  }

  if (jd > 0 && wd > 0) {
    var val = {
      x: jd,
      y: wd,
      z: height,
    }

    updateMarker(val, true)
  }
}


function bindMourseClick() {
  $('body').addClass('cur-measure')

  //单击地图事件
  map.setCursor(true)
  map.on(mars3d.EventType.click, function (event) {
    var cartesian = event.cartesian
    if (cartesian) {
      var point = mars3d.LatLngPoint.fromCartesian(cartesian)
      point.format()

      var jd = point.lng
      var wd = point.lat
      var height = point.alt

      if (height == 0) {
        var _oldheight = $('#point_height').val()
        if (_oldheight.length == 0) {
          height = 0
        } else {
          height = Number(_oldheight)
        }
      }

      var val = {
        x: jd,
        y: wd,
        z: height,
      }
      updateMarker(val)

      //更新十进制的经纬度
      $('#point_jd').val(jd)
      $('#point_wd').val(wd)
      $('#point_height').val(height)

      //更新度分秒的经纬度
      let jddu = parseInt(jd);
      $('#du_jd').val(jddu)
      let jdfen=parseInt((jd % 1)*60);
      $('#fen_jd').val(jdfen)
      let jdmiao=(((jd % 1)*60) % 1)*60;
      $('#miao_jd').val(Math.round(jdmiao * 100) / 100)

      let wddu = parseInt(wd);
      $('#du_wd').val(wddu)
      let wdfen=parseInt((wd % 1)*60);
      $('#fen_wd').val(wdfen)
      let wdmiao=(((wd % 1)*60) % 1)*60;
      $('#miao_wd').val(Math.round(wdmiao * 100) / 100)

      $('#point_height2').val(height)

      //更新2000平面坐标
      var a = mars3d.PointTrans.proj4Trans([jd, wd], mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_3);//WGS84转CGCS2000三度带
      $('#san_jd').val(Math.round(a[0] * 100) / 100)
      $('#san_wd').val(Math.round(a[1] * 100) / 100)
      $('#point_height3').val(height)

      var b = mars3d.PointTrans.proj4Trans([jd, wd], mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_6);//WGS84转CGCS2000六度带
      $('#liu_jd').val(Math.round(b[0] * 100) / 100)
      $('#liu_wd').val(Math.round(b[1] * 100) / 100)
      $('#point_height4').val(height)
    }
  })
}

var pointEntity

function updateMarker(val, iscenter) {
  var position = Cesium.Cartesian3.fromDegrees(val.x, val.y, val.z)

  if (pointEntity == null) {
    pointEntity = new mars3d.graphic.PointEntity({
      position: position,
      style: {
        color: '#3388ff',
        pixelSize: 10,
        outlineColor: '#ffffff',
        outlineWidth: 2,
      },
    })
    map.graphicLayer.addGraphic(pointEntity)
  } else {
    pointEntity.position = position
  }
}


function change_jd(){  //十进制经度改变时，更新
  let jd_1 = Number($('#point_jd').val())//获取经度

  if(jd_1>180 || jd_1<-180){
    alert("请输入正确的经度值！")
    $('#point_jd').val(" ")
  }
  else{
    let jddu_1 = parseInt(jd_1);//度分秒改变
    $('#du_jd').val(jddu_1)
    let jdfen_1=parseInt((jd_1 % 1)*60);
    $('#fen_jd').val(jdfen_1)
    let jdmiao_1=(((jd_1 % 1)*60) % 1)*60;
    $('#miao_jd').val(Math.round(jdmiao_1 * 100) / 100)
  
    let wd_1 = $('#point_wd').val()
    if(wd_1.length>0){
      let wd_2 = Number($('#point_wd').val())
      CGCSchange(jd_1, wd_2)  //CGCS2000坐标改变
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
}

function change_wd(){  //十进制纬度改变时，更新
  let wd_1 = Number($('#point_wd').val())//获取

  if(wd_1>90 || wd_1<-90){
    alert("请输入正确的纬度值！")
    $('#point_wd').val(" ")
  }
  else{
    let wddu_1 = parseInt(wd_1);//度分秒改变
    $('#du_wd').val(wddu_1)
    let wdfen_1=parseInt((wd_1 % 1)*60);
    $('#fen_wd').val(wdfen_1)
    let wdmiao_1=(((wd_1 % 1)*60) % 1)*60;
    $('#miao_wd').val(Math.round(wdmiao_1 * 100) / 100)
  
    let jd_1 = $('#point_jd').val()
    if (jd_1.length>0){
      let jd_2 = Number($('#point_jd').val())
      CGCSchange(jd_2, wd_1)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
}

function changedu_jd(){  //度分秒，经度 度改变
  let jd_du = Number($('#du_jd').val())//获取
  let jd_fen = $('#fen_jd').val()
  let jd_miao = $('#miao_jd').val()
  if (jd_fen.length>0 && jd_miao.length>0){
    let jd_fen1 = Number($('#fen_jd').val())
    let jd_miao1 = Number($('#miao_jd').val())

    let jd1 = Math.round((jd_du + jd_fen1/60 + jd_miao1/3600) * 1000000) / 1000000
    $('#point_jd').val(jd1)//十进制改变

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd1, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_fen.length>0 || jd_miao.length==0){
    let jd_fen2 = Number($('#fen_jd').val())

    let jd2 = Math.round((jd_du + jd_fen2/60) * 1000000) / 1000000
    $('#point_jd').val(jd2)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd2, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_miao.length>0 || jd_fen.length==0){
    let jd_miao2 = Number($('#miao_jd').val())

    let jd3 = Math.round((jd_du + jd_miao2/3600) * 1000000) / 1000000
    $('#point_jd').val(jd3)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd3, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_fen.length==0 && jd_miao.length==0){
    $('#point_jd').val(jd_du)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd_du, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
}

function changefen_jd(){  //度分秒，经度 分改变
  let jd_fen = Number($('#fen_jd').val())//获取
  let jd_du = $('#du_jd').val()
  let jd_miao = $('#miao_jd').val()

  if (jd_du.length>0 && jd_miao.length>0){
    let jd_du1 = Number($('#du_jd').val())
    let jd_miao1 = Number($('#miao_jd').val())

    let jd1 = Math.round((jd_du1 + jd_fen/60 + jd_miao1/3600) * 1000000) / 1000000
    $('#point_jd').val(jd1)//十进制改变

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd1, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_du.length>0 || jd_miao.length==0){
    let jd_du2 = Number($('#du_jd').val())

    let jd2 = Math.round((jd_du2 + jd_fen/60) * 1000000) / 1000000
    $('#point_jd').val(jd2)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd2, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_miao.length>0 || jd_du.length==0){
    let jd_miao2 = Number($('#miao_jd').val())

    let jd3 = Math.round((jd_fen/60 + jd_miao2/3600) * 1000000) / 1000000
    $('#point_jd').val(jd3)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd3, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_du.length==0 && jd_miao.length==0){
    let jd4 = Math.round((jd_fen/60) * 1000000) / 1000000
    $('#point_jd').val(jd4)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd4, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
}

function changemiao_jd(){  //度分秒，经度 秒改变
  let jd_miao = Number($('#miao_jd').val())//获取
  let jd_du = $('#du_jd').val()
  let jd_fen = $('#fen_jd').val()

  if (jd_du.length>0 && jd_fen.length>0){
    let jd_du1 = Number($('#du_jd').val())
    let jd_fen1 = Number($('#fen_jd').val())

    let jd1 = Math.round((jd_du1 + jd_fen1/60 + jd_miao/3600) * 1000000) / 1000000
    $('#point_jd').val(jd1)//十进制改变

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd1, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_du.length>0 || jd_fen.length==0){
    let jd_du2 = Number($('#du_jd').val())

    let jd2 = Math.round((jd_du2 + jd_miao/3600) * 1000000) / 1000000
    $('#point_jd').val(jd2)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd2, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_fen.length>0 || jd_du.length==0){
    let jd_fen2 = Number($('#fen_jd').val())

    let jd3 = Math.round((jd_fen2/60 + jd_miao/3600) * 1000000) / 1000000
    $('#point_jd').val(jd3)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd3, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
  else if(jd_du.length==0 && jd_miao.length==0){
    let jd4 = Math.round((jd_miao/3600) * 1000000) / 1000000
    $('#point_jd').val(jd4)

    let wd = $('#point_wd').val()
    if(wd.length>0){
      let wd1 = Number($('#point_wd').val())
      CGCSchange(jd4, wd1)
    }
    else{
      $('#san_jd').val(" ")
      $('#liu_jd').val(" ")
    }
  }
}

function changedu_wd(){  //度分秒，纬度 度改变
  let wd_du = Number($('#du_wd').val())//获取
  let wd_fen = $('#fen_wd').val()
  let wd_miao = $('#miao_wd').val()
  if (wd_fen.length>0 && wd_miao.length>0){
    let wd_fen1 = Number($('#fen_wd').val())
    let wd_miao1 = Number($('#miao_wd').val())

    let wd1 = Math.round((wd_du + wd_fen1/60 + wd_miao1/3600) * 1000000) / 1000000
    $('#point_wd').val(wd1)//十进制改变

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd1)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_fen.length>0 || wd_miao.length==0){
    let wd_fen2 = Number($('#fen_wd').val())

    let wd2 = Math.round((wd_du + wd_fen2/60) * 1000000) / 1000000
    $('#point_wd').val(wd2)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd2)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_miao.length>0 || wd_fen.length==0){
    let wd_miao2 = Number($('#miao_wd').val())

    let wd3 = Math.round((wd_du + wd_miao2/3600) * 1000000) / 1000000
    $('#point_wd').val(wd3)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd3)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_fen.length==0 && wd_miao.length==0){
    $('#point_wd').val(wd_du)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd_du)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
}

function changefen_wd(){  //度分秒，纬度 分改变
  let wd_fen = Number($('#fen_wd').val())//获取
  let wd_du = $('#du_wd').val()
  let wd_miao = $('#miao_wd').val()
  if (wd_du.length>0 && wd_miao.length>0){
    let wd_du1 = Number($('#du_wd').val())
    let wd_miao1 = Number($('#miao_wd').val())

    let wd1 = Math.round((wd_du1 + wd_fen/60 + wd_miao1/3600) * 1000000) / 1000000
    $('#point_wd').val(wd1)//十进制改变

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd1)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_du.length>0 || wd_miao.length==0){
    let wd_du2 = Number($('#du_wd').val())

    let wd2 = Math.round((wd_du2 + wd_fen/60) * 1000000) / 1000000
    $('#point_wd').val(wd2)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd2)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_miao.length>0 || wd_du.length==0){
    let wd_miao2 = Number($('#miao_wd').val())

    let wd3 = Math.round((wd_fen/60 + wd_miao2/3600) * 1000000) / 1000000
    $('#point_wd').val(wd3)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd3)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_fen.length==0 && wd_miao.length==0){
    let wd4 = Math.round((wd_fen/60) * 1000000) / 1000000
    $('#point_wd').val(wd4)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd4)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
}

function changemiao_wd(){  //度分秒，纬度 秒改变
  let wd_miao = Number($('#miao_wd').val())//获取
  let wd_du = $('#du_wd').val()
  let wd_fen = $('#fen_wd').val()
  if (wd_du.length>0 && wd_fen.length>0){
    let wd_du1 = Number($('#du_wd').val())
    let wd_fen1 = Number($('#fen_wd').val())

    let wd1 = Math.round((wd_du1 + wd_fen1/60 + wd_miao/3600) * 1000000) / 1000000
    $('#point_wd').val(wd1)//十进制改变

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd1)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_du.length>0 || wd_fen.length==0){
    let wd_du2 = Number($('#du_wd').val())

    let wd2 = Math.round((wd_du2 + wd_miao/3600) * 1000000) / 1000000
    $('#point_wd').val(wd2)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd2)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_fen.length>0 || wd_du.length==0){
    let wd_fen2 = Number($('#fen_wd').val())

    let wd3 = Math.round((wd_fen2/60 + wd_miao/3600) * 1000000) / 1000000
    $('#point_wd').val(wd3)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd3)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
  else if(wd_fen.length==0 && wd_miao.length==0){
    let wd4 = Math.round((wd_miao/3600) * 1000000) / 1000000
    $('#point_wd').val(wd4)

    let jd = $('#point_jd').val()
    if (jd.length>0){
      let jd_1 = Number($('#point_jd').val())
      CGCSchange(jd_1, wd4)
    }
    else{
      $('#san_wd').val(" ")
      $('#liu_wd').val(" ")
    }
  }
}

function change_3jd(){  //CGCS2000三度带 经度变化
  let jd = Number($('#san_jd').val())//获取
  let wd = $('#san_wd').val()

  if(wd.length>0){
    let wd1 = Number($('san_wd').val)
    var a = mars3d.PointTrans.proj4Trans([jd, wd1], mars3d.CRS.CGCS2000_GK_Zone_3, mars3d.CRS.EPSG4326);
    $('#point_jd').val(Math.round(a[0] * 1000000) / 1000000) //WGS84十进制改变
    
    let jddu = parseInt(a[0]);  //WGS84度分秒改变
    $('#du_jd').val(jddu)
    let jdfen=parseInt((a[0] % 1)*60);
    $('#fen_jd').val(jdfen)
    let jdmiao=(((a[0] % 1)*60) % 1)*60;
    $('#miao_jd').val(Math.round(jdmiao * 100) / 100)
  
    var b = mars3d.PointTrans.proj4Trans(a, mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_6);
    $('#liu_jd').val(Math.round(b[0] * 100) / 100)  //CGCS2000六度带改变
  }
  else{
    $('#point_jd').val(" ")
    $('#du_jd').val(" ")
    $('#fen_jd').val(" ")
    $('#miao_jd').val(" ")
    $('#liu_jd').val(" ")
  }
}

function change_3wd(){  //CGCS2000三度带 纬度变化
  let wd = Number($('#san_wd').val())//获取
  $('#liu_wd').val(wd)

  let jd = $('#san_jd').val()
  if(jd.length>0){
    let jd1 = Number($('#san_jd').val())
    var a = mars3d.PointTrans.proj4Trans([jd1, wd], mars3d.CRS.CGCS2000_GK_Zone_3, mars3d.CRS.EPSG4326);
    $('#point_wd').val(Math.round(a[1] * 1000000) / 1000000) //WGS84十进制改变
  
    let wddu = parseInt(a[1]);  //WGS84度分秒改变
    $('#du_wd').val(wddu)
    let wdfen=parseInt((a[1] % 1)*60);
    $('#fen_wd').val(wdfen)
    let wdmiao=(((a[1] % 1)*60) % 1)*60;
    $('#miao_wd').val(Math.round(wdmiao * 100) / 100)
  }
  else{
    $('#point_wd').val(" ")
    $('#du_wd').val(" ")
    $('#fen_wd').val(" ")
    $('#miao_wd').val(" ")
  }
}

function change_6jd(){  //CGCS2000六度带 经度变化
  let jd = Number($('#liu_jd').val())//获取
  let wd = $('#liu_wd').val()

  if(wd.length>0){
    let wd1 = Number($('liu_wd').val)
    var a = mars3d.PointTrans.proj4Trans([jd, wd1], mars3d.CRS.CGCS2000_GK_Zone_6, mars3d.CRS.EPSG4326);
    $('#point_jd').val(Math.round(a[0] * 1000000) / 1000000) //WGS84十进制改变
    
    let jddu = parseInt(a[0]);  //WGS84度分秒改变
    $('#du_jd').val(jddu)
    let jdfen=parseInt((a[0] % 1)*60);
    $('#fen_jd').val(jdfen)
    let jdmiao=(((a[0] % 1)*60) % 1)*60;
    $('#miao_jd').val(Math.round(jdmiao * 100) / 100)
  
    var b = mars3d.PointTrans.proj4Trans(a, mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_3);
    $('#san_jd').val(Math.round(b[0] * 100) / 100)  //CGCS2000三度带改变
  }
  else{
    $('#point_jd').val(" ")
    $('#du_jd').val(" ")
    $('#fen_jd').val(" ")
    $('#miao_jd').val(" ")
    $('#liu_jd').val(" ")
  }
  
}

function change_6wd(){  //CGCS2000六度带 纬度变化
  let wd = Number($('#liu_wd').val())//获取
  $('#san_wd').val(wd)

  let jd = $('#liu_jd').val()
  if(jd.length>0){
    let jd1 = Number($('#liu_jd').val())
    var a = mars3d.PointTrans.proj4Trans([jd1, wd], mars3d.CRS.CGCS2000_GK_Zone_6, mars3d.CRS.EPSG4326);
    $('#point_wd').val(Math.round(a[1] * 1000000) / 1000000) //WGS84十进制改变
  
    let wddu = parseInt(a[1]);  //WGS84度分秒改变
    $('#du_wd').val(wddu)
    let wdfen=parseInt((a[1] % 1)*60);
    $('#fen_wd').val(wdfen)
    let wdmiao=(((a[1] % 1)*60) % 1)*60;
    $('#miao_wd').val(Math.round(wdmiao * 100) / 100)
  }
  else{
    $('#point_wd').val(" ")
    $('#du_wd').val(" ")
    $('#fen_wd').val(" ")
    $('#miao_wd').val(" ")
  }
}

function change_h1(){
  let h = Number($('#point_height').val())//获取
  $('#point_height2').val(h)
  $('#point_height3').val(h)
  $('#point_height4').val(h)
}

function change_h2(){
  let h = Number($('#point_height2').val())//获取
  $('#point_height').val(h)
  $('#point_height3').val(h)
  $('#point_height4').val(h)
}

function change_h3(){
  let h = Number($('#point_height3').val())//获取
  $('#point_height').val(h)
  $('#point_height2').val(h)
  $('#point_height4').val(h)
}

function change_h4(){
  let h = Number($('#point_height4').val())//获取
  $('#point_height').val(h)
  $('#point_height2').val(h)
  $('#point_height3').val(h)
}


function drawpoint(){   //坐标拾取功能
  bindMourseClick()
}

function pos(){  //定位功能

  let j = $('#point_jd').val()
  let w = $('#point_wd').val()
  if(j.length>0 && w.length>0){
    let jd = Number($('#point_jd').val())
    let wd = Number($('#point_wd').val())
    let height=Number($('#point_height').val())

    if(jd>180 || jd<-180 || wd>90 || wd<-90){
      alert("请确保输入值正确！")
    }
    else{
      let j1 = Number($('#du_jd').val())
      let j2 = Number($('#fen_jd').val())
      let j3 = Number($('#miao_jd').val())
      let w1 = Number($('#du_wd').val())
      let w2 = Number($('#fen_wd').val())
      let w3 = Number($('#miao_wd').val())
      if(((j1>=0 && j2>=0 && j3>=0) || (j1<=0 && j2<=0 && j3<=0)) && ((w1>=0 && w2>=0 && w3>=0) || (w1<=0 && w2<=0 && w3<=0))){
        map.setCameraView({ lat: wd, lng: jd, alt: 10000, pitch: -90 })//视角移动
        let val = {x: jd, y: wd, z: height,}
        updateMarker(val, true)//更新点
      }
      else{
        alert("请确保度分秒符号一致！")
      }
    }
  }
  else if(j.length>0 || w.length==0){
    alert("请输入纬度坐标！")
  }
  else if(w.length>0 || j.length==0){
    alert("请输入经度坐标！")
  }
}

function CGCSchange(jd, wd){
  var a = mars3d.PointTrans.proj4Trans([jd, wd], mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_3);
  $('#san_jd').val(Math.round(a[0] * 100) / 100)
  $('#san_wd').val(Math.round(a[1] * 100) / 100)
  var b = mars3d.PointTrans.proj4Trans([jd, wd], mars3d.CRS.EPSG4326, mars3d.CRS.CGCS2000_GK_Zone_6);
  $('#liu_jd').val(Math.round(b[0] * 100) / 100)
  $('#liu_wd').val(Math.round(b[1] * 100) / 100)
}
