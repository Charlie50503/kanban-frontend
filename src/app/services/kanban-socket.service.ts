import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Project, Column, KanbanTask } from '../api/v1/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KanbanSocketService {
  private hubConnection: HubConnection;
  private projectUpdatedSubject = new BehaviorSubject<Project | null>(null);
  private columnUpdatedSubject = new BehaviorSubject<Column | null>(null);
  private taskUpdatedSubject = new BehaviorSubject<KanbanTask | null>(null);
  private connectionEstablished = new BehaviorSubject<boolean>(false);

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/kanbanHub`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ProjectUpdated', (project: Project) => {
      this.projectUpdatedSubject.next(project);
    });

    this.hubConnection.on('ColumnUpdated', (column: Column) => {
      this.columnUpdatedSubject.next(column);
    });

    this.hubConnection.on('TaskUpdated', (task: KanbanTask) => {
      this.taskUpdatedSubject.next(task);
    });

    this.startConnection();

    // 監聽重新連接事件
    this.hubConnection.onreconnected(() => {
      console.log('SignalR Reconnected!');
      this.connectionEstablished.next(true);
    });

    // 監聽斷開連接事件
    this.hubConnection.onclose(() => {
      console.log('SignalR Disconnected!');
      this.connectionEstablished.next(false);
    });
  }

  private async startConnection() {
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected!');
      this.connectionEstablished.next(true);
    } catch (err) {
      console.error('Error while starting connection: ' + err);
      this.connectionEstablished.next(false);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  private async ensureConnection(): Promise<boolean> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return true;
    }

    try {
      await this.hubConnection.start();
      this.connectionEstablished.next(true);
      return true;
    } catch (err) {
      console.error('Error while ensuring connection: ' + err);
      this.connectionEstablished.next(false);
      return false;
    }
  }

  public async joinProjectGroup(projectId: string): Promise<boolean> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('無法建立連接');
      }

      await this.hubConnection.invoke('JoinProjectGroup', projectId);
      return true;
    } catch (err) {
      console.error('Error while joining project group: ' + err);
      return false;
    }
  }

  public async leaveProjectGroup(projectId: string): Promise<boolean> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('無法建立連接');
      }

      await this.hubConnection.invoke('LeaveProjectGroup', projectId);
      return true;
    } catch (err) {
      console.error('Error while leaving project group: ' + err);
      return false;
    }
  }

  public onProjectUpdated(): Observable<Project | null> {
    return this.projectUpdatedSubject.asObservable();
  }

  public onColumnUpdated(): Observable<Column | null> {
    return this.columnUpdatedSubject.asObservable();
  }

  public onTaskUpdated(): Observable<KanbanTask | null> {
    return this.taskUpdatedSubject.asObservable();
  }

  public onConnectionEstablished(): Observable<boolean> {
    return this.connectionEstablished.asObservable();
  }
}
