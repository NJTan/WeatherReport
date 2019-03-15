//index.js
var app=getApp();//获得全局app.js中的内容
var util = require('../../utils/util.js');//引用工具文件
Page({
  //数据初始化
  data: {
    latitude:'',
    longitude:'',
    loadingStatus:false,
    city:'',//城市
    currentTemperature:'',//当前温度
    currentTime:'',//当前时间
    currentDate:'',//当前日期
    // 用于天气数据
    weatherData: []
  },
  //获取地理位置的方法
  getLocation:function(){
     var that=this;
      wx.getLocation({
       type:'gc102',
       success: function(res) {
         let latitude=res.latitude;//纬度
         var longitude=res.longitude;//经度
        // var accuracy=res.accuracy;//精确度
         that.setData({
           latitude:latitude,
           longitude:longitude
         })
         console.log(latitude);
         console.log(longitude);
         wx.request({
           //url: 'http://apis.map.qq.com/ws/geocoder/v1/?location=137,128&output=json&key=t2Ni0GFk6oZaxQDOGjdYLG91xEYBtL3O',
           url:'https://apis.map.qq.com/ws/geocoder/v1/?location='+latitude+','+longitude+'&key=Z2MBZ-ZO53J-H5DFD-KWPZT-NO5NE-SHFUI',
           header: {
             'Content-Type': 'application/json'
           },
          
           success:function(res){
            var city=res.data.result.address_component.city;
             app.globalData.city = city;
           //  console.log(res);
          // console.log(city);
            // console.log(res);
            that.setData({
              city:city
            })
            console.log(city);
             that.getWeatherData(city);
           },
           fail: function (res) {
             wx.showToast({
               title: '网络不好请重试',
             });
             // getLocation();
           },
         })

       },
        fail: function () {
          wx.getSetting({//获取用户的设置
            success: function (res) {
              if (!(res.authSetting['scop.userLocation'])) {
                wx.showModal({
                  title: '是否授予当前位置',
                  content: '需要获取您的地理位置',
                  success: function (tip) {
                    if (tip.confirm) {
                      wx.openSetting({
                        success: function (data) {
                          if (data.authSetting["scope.userLocation"] === true) {
                            wx.showToast({
                              title: '授权成功',
                              icon: 'success',
                              duration: 1000
                            })
                          }
                          else{
                            wx.showToast({
                              title: '取消获取',
                              content: '退出小程序'
                            });
                            wx.navigateBack({
                              delta: -1
                            })
                          }
                          },
                         
                      })

                      //授权成功之后
                      wx.getLocation({
                        success: function (res) {
                          let latitude = res.latitude;//纬度
                          var longitude = res.longitude;//经度
                          that.setData({
                            latitude: latitude,
                            longitude: longitude
                          })
                          wx.request({
                            //url: 'http://apis.map.qq.com/ws/geocoder/v1/?location=137,128&output=json&key=t2Ni0GFk6oZaxQDOGjdYLG91xEYBtL3O',
                            url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + latitude + ',' + longitude + '&key=Z2MBZ-ZO53J-H5DFD-KWPZT-NO5NE-SHFUI',
                            header: {
                              'Content-Type': 'application/json'
                            },
                            success: function (res) {
                              var city = res.data.result.address_component.city;
                              app.globalData.city = city;
                              //  console.log(res);
                              // console.log(city);
                              // console.log(res);
                              that.setData({
                                city: app.globalData.city

                              })
                              console.log(city);
                              that.getWeatherData(city);
                            },
                            
                          })
                        }
                      })
                    }
                    else{
                      wx.showToast({
                        title: '取消获取',
                        content: '退出小程序'
                      });
                       wx.navigateBack({
                        delta: -1
                      })

                    }
                  },
                  fail: function (tip) {
                    if(tip.cancel){
                        wx.showToast({
                          title: '取消获取',
                          content:'退出小程序'
                        });
                      wx.navigateBack({
                        delta: -1
                      })
                    }
                  }
                })
              }
            }
          })
        },

      })

  },
  //获取天气信息的方法
  getWeatherData:function(city){
    var that=this;
    wx.request({
      url:'https://api.map.baidu.com/telematics/v3/weather?location='+city+'&output=json&ak=t2Ni0GFk6oZaxQDOGjdYLG91xEYBtL3O',
      header: {
        'Content-Type': 'application/json'
      },
    
      success:function(res){
       // console.log(res.data.results[0].weather_data[0].date);
        //获取实时的温度
        var date = res.data.results[0].weather_data[0].date
        var currentTem=date.split('：');
           currentTem[1]=currentTem[1].split(')');
         //console.log(currentTem);
       
        var currentTemperature=currentTem[1][0]
        that.setData({
         // weather:res.data.results[0].index,
         currentTemperature:currentTem[1][0],
         weatherData:res.data.results[0].weather_data
        })
       // console.log(weatherData);
      }
    })
  },
  //获取时间的函数
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;

  },
  // 加载执行
  onLoad: function (options) {
    var that=this;
    // 获取当前时间，并拆分成日期和时间两部分
    var current_time = util.formatTime(new Date()).split(' ');
    // 将时间部分记录，用于判断早晚
    console.log(current_time[0] );
    that.setData({
      currentDate:current_time[0],
      currentTime: current_time[1]
    });
    
    // 调用获取天气和地理位置的方法
   that.getLocation();
     
  }
})
