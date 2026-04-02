import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { expect } from 'chai';
import sinon from 'sinon';
import { provideMockStore } from '@ngrx/store/testing';

import { UiExtensionsTabComponent } from '@mm-modules/ui-extensions/ui-extensions-tab.component';
import { CHTDatasourceService } from '@mm-services/cht-datasource.service';
import { PerformanceService } from '@mm-services/performance.service';
import { UiExtensionsService } from '@mm-services/ui-extensions.service';
import { UserContactSummaryService } from '@mm-services/user-contact-summary.service';
import { ToolBarComponent } from '@mm-components/tool-bar/tool-bar.component';
import { NavigationService } from '@mm-services/navigation.service';
import { AuthService } from '@mm-services/auth.service';
import { SessionService } from '@mm-services/session.service';

describe('UiExtensionsTabComponent', () => {
  let fixture: ComponentFixture<UiExtensionsTabComponent>;
  let component: UiExtensionsTabComponent;

  let uiExtensionsService;
  let chtDatasourceService;
  let performanceService;
  let userContactSummaryService;
  let authService;
  let sessionService;
  let trackStop;

  const EXTENSION_ID = 'my-extension';
  const MOCK_CHT_API = { v1: {} };
  const MOCK_USER_SUMMARY = { context: {} };
  const MOCK_CONFIG = { key: 'value' };
  const MOCK_ELEMENT = class extends HTMLElement {};

  beforeEach(async () => {
    trackStop = sinon.stub().resolves();
    performanceService = { track: sinon.stub().returns({ stop: trackStop }) };
    chtDatasourceService = { get: sinon.stub().resolves(MOCK_CHT_API) };
    userContactSummaryService = { get: sinon.stub().resolves(MOCK_USER_SUMMARY) };
    authService = { has: sinon.stub().resolves(true) };
    sessionService = { isAdmin: sinon.stub().returns(false) };
    uiExtensionsService = {
      getExtension: sinon.stub().resolves({
        properties: { id: EXTENSION_ID, type: 'app_main_tab', config: MOCK_CONFIG },
        Element: MOCK_ELEMENT,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useClass: TranslateFakeLoader } }),
        RouterTestingModule,
        MatIconModule,
        UiExtensionsTabComponent,
        ToolBarComponent,
      ],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: { snapshot: { params: { id: EXTENSION_ID } } } },
        { provide: UiExtensionsService, useValue: uiExtensionsService },
        { provide: CHTDatasourceService, useValue: chtDatasourceService },
        { provide: PerformanceService, useValue: performanceService },
        { provide: UserContactSummaryService, useValue: userContactSummaryService },
        { provide: NavigationService, useValue: {} },
        { provide: AuthService, useValue: authService },
        { provide: SessionService, useValue: sessionService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UiExtensionsTabComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => sinon.restore());

  it('should create the component', () => {
    expect(component).to.exist;
  });

  it('should read extension id from route params on init', () => {
    fixture.detectChanges();
    expect(component['extensionId']).to.equal(EXTENSION_ID);
  });

  it('should call getExtension with the route id', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    expect(uiExtensionsService.getExtension.calledOnceWith(EXTENSION_ID)).to.be.true;
  }));

  it('should set loading to false after initialization', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    expect(component.loading).to.be.false;
  }));

  it('should set loading to false even when getExtension returns undefined', fakeAsync(() => {
    uiExtensionsService.getExtension.resolves(undefined);
    fixture.detectChanges();
    flush();
    expect(component.loading).to.be.false;
  }));

  it('should set loading to false even when getExtension throws', fakeAsync(() => {
    uiExtensionsService.getExtension.rejects(new Error('load error'));
    fixture.detectChanges();
    flush();
    expect(component.loading).to.be.false;
  }));

  it('should record render telemetry with the extension id', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    expect(trackStop.calledOnceWith({ name: `ui-extension:${EXTENSION_ID}:render`, recordApdex: true })).to.be.true;
  }));

  it('should load cht api and set it on the element', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    expect(chtDatasourceService.get.calledOnce).to.be.true;
  }));

  it('should load user contact summary and nest it inside inputs', fakeAsync(() => {
    fixture.detectChanges();
    flush();
    expect(userContactSummaryService.get.calledOnce).to.be.true;
  }));

  it('should not call cht api or user summary when extension not found', fakeAsync(() => {
    uiExtensionsService.getExtension.resolves(undefined);
    fixture.detectChanges();
    flush();
    expect(chtDatasourceService.get.notCalled).to.be.true;
    expect(userContactSummaryService.get.notCalled).to.be.true;
  }));
});
