import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TaskService } from './core/services/task.service';

describe('AppComponent', () => {
  let taskServiceMock: any;

  beforeEach(async () => {
    taskServiceMock = {
      getTasks: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: TaskService, useValue: taskServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title in toolbar', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const toolbar = compiled.querySelector('mat-toolbar');
    expect(toolbar?.textContent).toContain('NetConfig Manager POC');
  });
});
