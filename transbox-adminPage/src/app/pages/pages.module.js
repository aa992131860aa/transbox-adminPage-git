/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function() {
  'use strict';

  angular.module('BlurAdmin.pages', [
      'ui.router',

      // 'BlurAdmin.pages.dashboard',
      // 'BlurAdmin.pages.ui',
      // 'BlurAdmin.pages.components',
      // 'BlurAdmin.pages.form',
      // 'BlurAdmin.pages.tables',
      // 'BlurAdmin.pages.charts',
      // 'BlurAdmin.pages.maps',
      // 'BlurAdmin.pages.profile',
      
      'BlurAdmin.pages.transbox',
    ])
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    var accountType = getCookie('type');

    if (accountType === 'admin') {
      $urlRouterProvider.otherwise('/hospital');

      // baSidebarServiceProvider.addStaticItem({
      //   title: 'Pages',
      //   icon: 'ion-document',
      //   subMenu: [{
      //     title: 'Sign In',
      //     fixedHref: 'auth.html',
      //     blank: true
      //   }, {
      //     title: 'Sign Up',
      //     fixedHref: 'reg.html',
      //     blank: true
      //   }, {
      //     title: 'User Profile',
      //     stateRef: 'profile'
      //   }, {
      //     title: '404 Page',
      //     fixedHref: '404.html',
      //     blank: true
      //   }]
      // });
      // baSidebarServiceProvider.addStaticItem({
      //   title: 'Menu Level 1',
      //   icon: 'ion-ios-more',
      //   subMenu: [{
      //     title: 'Menu Level 1.1',
      //     disabled: true
      //   }, {
      //     title: 'Menu Level 1.2',
      //     subMenu: [{
      //       title: 'Menu Level 1.2.1',
      //       disabled: true
      //     }]
      //   }]
      // });

      //add by blackmat below
      baSidebarServiceProvider.addStaticItem({
        title: '转运实时监控',
        icon: 'ion-grid',
        stateRef: 'transfering',
        blank: true
      });

      baSidebarServiceProvider.addStaticItem({
        title: '转运历史查询',
        icon: 'ion-grid',
        stateRef: 'history',
        blank: true
      });

      baSidebarServiceProvider.addStaticItem({
        title: '数据库管理',
        icon: 'ion-gear-a',
        subMenu: [{
          title: '医院',
          stateRef: 'hospital',
          blank: false
        }, {
          title: 'OPO',
          stateRef: 'opo',
          blank: false
        }, {
          title: '设备',
          stateRef: 'box',
          blank: false
        }, {
          title: '配件',
          stateRef: 'fitting',
          blank: false
        }]
      });

    } else {
      $urlRouterProvider.otherwise('/transfering');
      baSidebarServiceProvider.addStaticItem({
        title: '转运实时监控',
        icon: 'ion-grid',
        stateRef: 'transfering',
        blank: true
      });

      baSidebarServiceProvider.addStaticItem({
        title: '转运历史查询',
        icon: 'ion-grid',
        stateRef: 'history',
        blank: true
      });
    }

  }

  function getCookie(c_name) {
    if (document.cookie.length > 0) {
      var c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1) {
        c_start = c_start + c_name.length + 1;
        var c_end = document.cookie.indexOf(";", c_start);
        if (c_end == -1) c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return "";
  }



})();