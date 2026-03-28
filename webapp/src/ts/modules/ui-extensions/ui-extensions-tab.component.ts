import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';

import { CHTDatasourceService } from '@mm-services/cht-datasource.service';
import { PerformanceService } from '@mm-services/performance.service';
import { UiExtensionsService } from '@mm-services/ui-extensions.service';
import { UserContactSummaryService } from '@mm-services/user-contact-summary.service';
import { ToolBarComponent } from '@mm-components/tool-bar/tool-bar.component';

@Component({
  templateUrl: './ui-extensions-tab.component.html',
  imports: [ToolBarComponent, NgIf]
})
export class UiExtensionsTabComponent implements OnInit, AfterViewInit {
  @ViewChild('uiElementTab') container!: ElementRef;

  loading = true;
  private extensionId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly chtDatasourceService: CHTDatasourceService,
    private readonly performanceService: PerformanceService,
    private readonly uiExtensionsService: UiExtensionsService,
    private readonly userContactSummaryService: UserContactSummaryService,
  ) {}

  ngOnInit() {
    this.extensionId = this.route.snapshot.params['id'];
  }

  async ngAfterViewInit() {
    await this.initializeExtension();
  }

  private async initializeExtension() {
    const trackRender = this.performanceService.track();
    try {
      const extension = await this.uiExtensionsService.getExtension(this.extensionId);
      if (!extension) {
        return;
      }

      const { properties, Element } = extension;

      if (!customElements.get(this.extensionId)) {
        customElements.define(this.extensionId, Element as unknown as CustomElementConstructor);
      }
      const element = document.createElement(this.extensionId);

      Object.assign(element, {
        cht: await this.chtDatasourceService.get(),
        inputs: {
          config: properties.config,
          userContactSummary: await this.userContactSummaryService.get(),
        },
      });

      this.container.nativeElement.appendChild(element);
    } catch (error) {
      console.error(`Error initializing UI extension: "${this.extensionId}"`, error);
    } finally {
      this.loading = false;
      await trackRender?.stop({ name: `ui-extension:${this.extensionId}:render`, recordApdex: true });
    }
  }
}