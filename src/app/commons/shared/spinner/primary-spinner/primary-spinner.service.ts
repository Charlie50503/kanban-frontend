import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, BehaviorSubject } from 'rxjs';
interface SecondarySpinnerOptions {
  text: string;
  type:
    | 'timer'
    | 'square-jelly-box'
    | 'ball-climbing-dot'
    | 'ball-clip-rotate-multiple'
    | 'ball-scale-multiple';
}
@Injectable({
  providedIn: 'root',
})
export class PrimarySpinnerService {
  private readonly defaultOptions: SecondarySpinnerOptions = {
    text: 'Loading...',
    type: 'ball-scale-multiple',
  };

  private isShowSubject = new Subject<boolean>();

  private optionsSubject = new BehaviorSubject<SecondarySpinnerOptions>(
    this.defaultOptions,
  );
  //* NOTICE 需要等到該套件完全支援 Angular 17 才能卻能確認其他的可不可以用
  private loadingTypeList = [
    'timer',
    'square-jelly-box',
    'ball-climbing-dot',
    'ball-clip-rotate-multiple',
  ];

  constructor(private spinnerService: NgxSpinnerService) {}

  public isLoading$() {
    return this.isShowSubject.asObservable();
  }

  public options$() {
    return this.optionsSubject.asObservable();
  }

  public open(options: SecondarySpinnerOptions | undefined = undefined) {
    if (options) {
      this.optionsSubject.next(options);
    }
    this.isShowSubject.next(true);
    // var random = Math.floor(Math.random() * 4); //0~3
    // this.loadingType.next(this.loadingTypeList.find((f,index)=>{return index==random}) || 'timer');
    this.spinnerService.show();
  }

  public close() {
    setTimeout(() => {
      this.isShowSubject.next(false);
      this.spinnerService.hide();
    }, 500);
  }

  public getDefaultOptions() {
    return this.defaultOptions;
  }
}
