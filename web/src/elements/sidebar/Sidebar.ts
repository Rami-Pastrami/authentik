import { AKElement } from "@goauthentik/elements/Base";
import "@goauthentik/elements/sidebar/SidebarBrand";
import "@goauthentik/elements/sidebar/SidebarUser";

import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import PFNav from "@patternfly/patternfly/components/Nav/nav.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { UiThemeEnum } from "@goauthentik/api";

@customElement("ak-sidebar")
export class Sidebar extends AKElement {
    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFPage,
            PFNav,
            css`
                :host {
                    z-index: 100;
                }
                .pf-v5-c-nav__link.pf-m-current::after,
                .pf-v5-c-nav__link.pf-m-current:hover::after,
                .pf-v5-c-nav__item.pf-m-current:not(.pf-m-expanded) .pf-v5-c-nav__link::after {
                    --pf-v5-c-nav__link--m-current--after--BorderColor: #fd4b2d;
                }
                :host([theme="light"]) {
                    border-right-color: transparent !important;
                }

                .pf-v5-c-nav__section + .pf-v5-c-nav__section {
                    --pf-v5-c-nav__section--section--MarginTop: var(--pf-v5-global--spacer--sm);
                }
                .pf-v5-c-nav__list .sidebar-brand {
                    max-height: 82px;
                    margin-bottom: -0.5rem;
                }
                nav {
                    display: flex;
                    flex-direction: column;
                    max-height: 100vh;
                    height: 100%;
                    overflow-y: hidden;
                }
                .pf-v5-c-nav__list {
                    flex-grow: 1;
                    overflow-y: auto;
                }

                .pf-v5-c-nav__link {
                    --pf-v5-c-nav__link--PaddingTop: 0.5rem;
                    --pf-v5-c-nav__link--PaddingRight: 0.5rem;
                    --pf-v5-c-nav__link--PaddingBottom: 0.5rem;
                }
                .pf-v5-c-nav__section-title {
                    font-size: 12px;
                }
                .pf-v5-c-nav__item {
                    --pf-v5-c-nav__item--MarginTop: 0px;
                }
            `,
        ];
    }

    render(): TemplateResult {
        return html`<nav
            class="pf-v5-c-nav ${this.activeTheme === UiThemeEnum.Light ? "pf-m-light" : ""}"
            aria-label="Global"
        >
            <ak-sidebar-brand></ak-sidebar-brand>
            <ul class="pf-v5-c-nav__list">
                <slot></slot>
            </ul>
            <ak-sidebar-user></ak-sidebar-user>
        </nav>`;
    }
}
