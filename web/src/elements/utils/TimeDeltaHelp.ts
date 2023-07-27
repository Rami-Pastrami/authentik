import { AKElement } from "@goauthentik/elements/Base";
import "@goauthentik/elements/Tooltip";

import { msg } from "@lit/localize";
import { CSSResult, TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFList from "@patternfly/patternfly/components/List/list.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

@customElement("ak-utils-time-delta-help")
export class TimeDeltaHelp extends AKElement {
    @property({ type: Boolean })
    negative = false;

    static get styles(): CSSResult[] {
        return [PFBase, PFForm, PFList];
    }

    render(): TemplateResult {
        return html` <ak-tooltip>
            <p class="pf-v5-c-form__helper-text" slot="trigger">
                ${this.negative
                    ? msg("(Format: hours=-1;minutes=-2;seconds=-3).")
                    : msg("(Format: hours=1;minutes=2;seconds=3).")}
                <i class="pf-icon fa fa-question-circle" aria-hidden="true"></i>
            </p>

            <div slot="tooltip">
                ${msg("The following keywords are supported:")}
                <ul class="pf-v5-c-list">
                    <li><pre>microseconds</pre></li>
                    <li><pre>milliseconds</pre></li>
                    <li><pre>seconds</pre></li>
                    <li><pre>minutes</pre></li>
                    <li><pre>hours</pre></li>
                    <li><pre>days</pre></li>
                    <li><pre>weeks</pre></li>
                </ul>
            </div>
        </ak-tooltip>`;
    }
}
