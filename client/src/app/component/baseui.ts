import { LoadingController, ToastController, AlertController } from '@ionic/angular';

export abstract class BaseUI {
    constructor() {
    }

    /**
     * loading加载页面
     * @param {LoadingController} loadingCtrl
     * @param {string} message
     * @returns {Loading}
     * @memberof BaseUI
     */
    protected async presentLoading(loadingCtrl: LoadingController,
            message: string) {
            const loader = await loadingCtrl.create({
                message: message
            });
            await loader.present();
            return loader;
         }

    /**
     * Toast全局提示
     * @param {ToastController} toastCtrl
     * @param {string} message
     * @returns {toast}
     * @memberof BaseUI
     */
    protected async presentToast(toastCtrl: ToastController, message: string) {
        const toast = await toastCtrl.create({
            message: message,
            duration: 3000,  // 默认展示的时长
            position: 'bottom',
            cssClass: 'ion-toast-yihe',/*cssClass必须写在全局*/
        });
        await toast.present();
        return toast;
    }

        /**
     * Toast全局提示
     * @param {ToastController} toastCtrl
     * @param {string} message
     * @returns {toast}
     * @memberof BaseUI
     */
    protected async presentFailureToast(toastCtrl: ToastController, message: string) {
        const toast = await toastCtrl.create({
            message: message,
            duration: 2000,  // 默认展示的时长
            position: 'middle',
            color: 'dark', 
            cssClass: 'ion-toast-yihe',/*cssClass必须写在全局*/
        });
        await toast.present();
        return toast;
    }

    protected async presentAlert(alertCtrl:AlertController, message: string) {
        const alert = await alertCtrl.create({
          header: '提示',
          //subHeader: 'Subtitle',
          message: message ? message : '',
          //cssClass: 'ion-toast-yihe',
          buttons: ['确定']
        });

        await alert.present();
        return alert;
    }
}