import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';


interface pageInterface {
  pageName: string;
  isShow?: boolean;
  route: string;
  type: 'link' | 'menu';
  children?: pageInterface[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatExpansionModule,
    MatListModule,
  ],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('drawer') sidenav!: MatSidenav;
  public userInfo = this.userService.getUserInfo();
  public isDisplayRoleSettingButton = false;
  public isProduction = environment.production;
  public environmentName = environment.name;
  public modulePageList: pageInterface[] = [
    {
      pageName: '一般系統',
      isShow: true,
      route: '/main/SystemManagement/List',
      type: 'link',
      children: [],
    },
    {
      pageName: '表單系統',
      isShow: true,
      route: '/FormSystem',
      type: 'menu',
      children: [
        {
          pageName: '博格',
          isShow: true,
          route: '/main/FormSystem/2/Detail',
          type: 'link',
          children: [],
        },
      ],
    },
  ];

  constructor(
    public userService: UserService,
    private tokenService: TokenService,
    public router: Router,
    private observer: BreakpointObserver,
  ) {}

  public onLogout() {
    this.tokenService.removeAllAccessToken();
    this.router.navigate(['login'], {
      queryParams: { isDisabledAutoLogin: 'true' },
    });
  }

  public ngAfterViewInit(): void {
    this.observer.observe(['(max-width: 768px)']).subscribe((res) => {
      setTimeout(() => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      }, 0);
    });
  }
}
