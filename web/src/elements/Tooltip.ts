import { AKElement } from "@goauthentik/elements/Base";

import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import PFTooltip from "@patternfly/patternfly/components/Tooltip/tooltip.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

@customElement("ak-tooltip")
export class Tooltip extends AKElement {
    @state()
    open = false;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFTooltip,
            css`
                .pf-v5-c-tooltip__content {
                    text-align: inherit;
                }
                .outer {
                    position: relative;
                }
                .pf-v5-c-tooltip {
                    position: absolute;
                    z-index: 999;
                }
            `,
        ];
    }

    render(): TemplateResult {
        return html`<slot
                @mouseenter=${() => {
                    this.open = true;
                }}
                @mouseleave=${() => {
                    this.open = false;
                }}
                name="trigger"
            ></slot>
            ${this.open
                ? html`<div class="outer">
                      <div class="pf-v5-c-tooltip" role="tooltip">
                          <div class="pf-v5-c-tooltip__arrow"></div>

                          <div class="pf-v5-c-tooltip__content">
                              <slot name="tooltip"></slot>
                          </div>
                      </div>
                  </div>`
                : html``}`;
    }
}
