// pages/test/test.js
import regeneratorRuntime from '../../utils/third-party/runtime' // eslint-disable-line
import { api } from '../../config/api'
import { request, login, authorize } from '../../utils/lib/request'
import { showError } from '../../utils/lib/error'
import {wxRequest}from '../../utils/lib/wxApi'
var util = require('../../utils/util.js');//引用工具文件
const app=getApp();
var latitude;
var longitude;
var city;
Page({

    /**
     * 页面的初始数据
     */
    data: {
      city: '',//城市
      currentTemperature: '',//当前温度
      currentTime: '',//当前时间
      currentDate: '',//当前日期
      // 用于天气数据
      weatherData: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
   

    bindInput(e) {
        console.log(e)
        this.setData({
            [e.currentTarget.dataset.key]: e.detail.value
        })
    },
//获取城市信息
async getCity(latitude,longitude){
   try{
     var that = this;
     //参数
     var params = {
       location: latitude + ',' + longitude,
       key: 'Z2MBZ-ZO53J-H5DFD-KWPZT-NO5NE-SHFUI'

     };
     let res=await wxRequest({
       url: 'https://apis.map.qq.com/ws/geocoder/v1/',
       data:params,
       header: {
         'Content-Type': 'application/json'
       }  
     }) 
     if(res.statusCode===200){
        city=res.data.result.address_component.city;
       console.log(city);
       that.setData({
         city:city,
       })
       that.getWeather(city);
     }
    else{
      showError("获取城市信息失败");
    }
   }   
  
   catch(e){
     console.error(e)
   }
},
//获取天气信息的方法
async getWeather(city){
   try{
     var that =this;
     var params={
       location:city,
       ak:'t2Ni0GFk6oZaxQDOGjdYLG91xEYBtL3O',
      output:'json'
     }
     var res =await wxRequest({
        url:'https://api.map.baidu.com/telematics/v3/weather', 
        data:params,   
       header: {
         'Content-Type': 'application/json'
       }
     })
     //console.log(res.data.results[0]);
     if(res.statusCode==200){
       var date = res.data.results[0].weather_data[0].date
       var currentTem = date.split('：');
       currentTem[1] = currentTem[1].split(')');
      // console.log(currentTem);

       var currentTemperature = currentTem[1][0]
       that.setData({
         // weather:res.data.results[0].index,
         currentTemperature: currentTem[1][0],
         weatherData: res.data.results[0].weather_data
       })
     }
     else{
       showError("获取天气信息失败")
     }
   }catch(e){
     console.error(e)
   }
},
  onLoad: function (options) {
    var that = this;
    // 获取当前时间，并拆分成日期和时间两部分
    var current_time = util.formatTime(new Date()).split(' ');
    // 将时间部分记录，用于判断早晚
    console.log(current_time[0]);
    that.setData({
      currentDate: current_time[0],
      currentTime: current_time[1]
    });
    that.getLocation()
  },
  //获取地理坐标的方法
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'gc102',
      success: function (res) {
        let latitude = res.latitude;//纬度
        var longitude = res.longitude;//经度
        // var accuracy=res.accuracy;//精确度
        that.setData({
          latitude: latitude,
          longitude: longitude
        })
       that.getCity(latitude,longitude);
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
                        else {
                        /*  wx.showToast({
                            title: '取消获取',
                            content: '退出小程序'
                          });*/
                          showError("取消获取位置")
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
                        that.getCity(latitude, longitude);
                      }
                    })
                  }
                  else {
                   /* wx.showToast({
                      title: '取消获取',
                      content: '退出小程序'
                    });*/
                    showError("获取城市信息失败")
                    wx.navigateBack({
                      delta: -1
                    })

                  }
                },
                fail: function (tip) {
                  if (tip.cancel) {
                   /* wx.showToast({
                      title: '取消获取',
                      content: '退出小程序'
                    });*/
                    showError("取消授权")
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
    /**
     * 校园网登录方法
     */
    async login() {
        try {
            await login(this.data.account, this.data.password)
        } catch (e) {
            console.error(e)
            if (e.message === '密码错误') {
                await showError('密码错误')
            } else {
                await showError()
            }

        }
    },

    /**
     * Oauth授权方法
     */
    async authorize() {
        try {
            await authorize()
        } catch (e) {
            console.error(e)
            if (e.message.indexOf('Oauth登录过期，请重新登录') > -1) {
                await showError('登录过期，请重新登录')
                console.log('重定向到登录页面')
            } else {
                await showError()
            }
        }
    },

    async getUserInfo() {
        await request({
            url: api.user_info
        })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
