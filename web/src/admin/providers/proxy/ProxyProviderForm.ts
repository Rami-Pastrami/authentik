import { RenderFlowOption } from "@goauthentik/admin/flows/utils";
import { DEFAULT_CONFIG } from "@goauthentik/common/api/config";
import { first } from "@goauthentik/common/utils";
import "@goauthentik/elements/forms/FormGroup";
import "@goauthentik/elements/forms/HorizontalFormElement";
import { ModelForm } from "@goauthentik/elements/forms/ModelForm";
import "@goauthentik/elements/forms/SearchSelect";
import "@goauthentik/elements/utils/TimeDeltaHelp";

import { msg } from "@lit/localize";
import { CSSResult, css } from "lit";
import { TemplateResult, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFList from "@patternfly/patternfly/components/List/list.css";
import PFToggleGroup from "@patternfly/patternfly/components/ToggleGroup/toggle-group.css";
import PFSpacing from "@patternfly/patternfly/utilities/Spacing/spacing.css";

import {
    CertificateKeyPair,
    CryptoApi,
    CryptoCertificatekeypairsListRequest,
    Flow,
    FlowsApi,
    FlowsInstancesListDesignationEnum,
    FlowsInstancesListRequest,
    PaginatedOAuthSourceList,
    PaginatedScopeMappingList,
    PropertymappingsApi,
    ProvidersApi,
    ProxyMode,
    ProxyProvider,
    SourcesApi,
} from "@goauthentik/api";

@customElement("ak-provider-proxy-form")
export class ProxyProviderFormPage extends ModelForm<ProxyProvider, number> {
    static get styles(): CSSResult[] {
        return super.styles.concat(
            PFToggleGroup,
            PFContent,
            PFList,
            PFSpacing,
            css`
                .pf-v5-c-toggle-group {
                    justify-content: center;
                }
            `,
        );
    }

    async loadInstance(pk: number): Promise<ProxyProvider> {
        const provider = await new ProvidersApi(DEFAULT_CONFIG).providersProxyRetrieve({
            id: pk,
        });
        this.showHttpBasic = first(provider.basicAuthEnabled, true);
        this.mode = first(provider.mode, ProxyMode.Proxy);
        return provider;
    }

    async load(): Promise<void> {
        this.propertyMappings = await new PropertymappingsApi(
            DEFAULT_CONFIG,
        ).propertymappingsScopeList({
            ordering: "scope_name",
        });
        this.oauthSources = await new SourcesApi(DEFAULT_CONFIG).sourcesOauthList({
            ordering: "name",
            hasJwks: true,
        });
    }

    propertyMappings?: PaginatedScopeMappingList;
    oauthSources?: PaginatedOAuthSourceList;

    @state()
    showHttpBasic = true;

    @state()
    mode: ProxyMode = ProxyMode.Proxy;

    getSuccessMessage(): string {
        if (this.instance) {
            return msg("Successfully updated provider.");
        } else {
            return msg("Successfully created provider.");
        }
    }

    async send(data: ProxyProvider): Promise<ProxyProvider> {
        data.mode = this.mode;
        if (this.mode !== ProxyMode.ForwardDomain) {
            data.cookieDomain = "";
        }
        if (this.instance) {
            return new ProvidersApi(DEFAULT_CONFIG).providersProxyUpdate({
                id: this.instance.pk || 0,
                proxyProviderRequest: data,
            });
        } else {
            return new ProvidersApi(DEFAULT_CONFIG).providersProxyCreate({
                proxyProviderRequest: data,
            });
        }
    }

    renderHttpBasic(): TemplateResult {
        return html`<ak-form-element-horizontal
                label=${msg("HTTP-Basic Username Key")}
                name="basicAuthUserAttribute"
            >
                <input
                    type="text"
                    value="${ifDefined(this.instance?.basicAuthUserAttribute)}"
                    class="pf-v5-c-form-control"
                />
                <p class="pf-v5-c-form__helper-text">
                    ${msg(
                        "User/Group Attribute used for the user part of the HTTP-Basic Header. If not set, the user's Email address is used.",
                    )}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${msg("HTTP-Basic Password Key")}
                name="basicAuthPasswordAttribute"
            >
                <input
                    type="text"
                    value="${ifDefined(this.instance?.basicAuthPasswordAttribute)}"
                    class="pf-v5-c-form-control"
                />
                <p class="pf-v5-c-form__helper-text">
                    ${msg(
                        "User/Group Attribute used for the password part of the HTTP-Basic Header.",
                    )}
                </p>
            </ak-form-element-horizontal>`;
    }

    renderModeSelector(): TemplateResult {
        return html` <div class="pf-v5-c-toggle-group__item">
                <button
                    class="pf-v5-c-toggle-group__button ${this.mode === ProxyMode.Proxy
                        ? "pf-m-selected"
                        : ""}"
                    type="button"
                    @click=${() => {
                        this.mode = ProxyMode.Proxy;
                    }}
                >
                    <span class="pf-v5-c-toggle-group__text">${msg("Proxy")}</span>
                </button>
            </div>
            <div class="pf-v5-c-divider pf-m-vertical" role="separator"></div>
            <div class="pf-v5-c-toggle-group__item">
                <button
                    class="pf-v5-c-toggle-group__button ${this.mode === ProxyMode.ForwardSingle
                        ? "pf-m-selected"
                        : ""}"
                    type="button"
                    @click=${() => {
                        this.mode = ProxyMode.ForwardSingle;
                    }}
                >
                    <span class="pf-v5-c-toggle-group__text"
                        >${msg("Forward auth (single application)")}</span
                    >
                </button>
            </div>
            <div class="pf-v5-c-divider pf-m-vertical" role="separator"></div>
            <div class="pf-v5-c-toggle-group__item">
                <button
                    class="pf-v5-c-toggle-group__button ${this.mode === ProxyMode.ForwardDomain
                        ? "pf-m-selected"
                        : ""}"
                    type="button"
                    @click=${() => {
                        this.mode = ProxyMode.ForwardDomain;
                    }}
                >
                    <span class="pf-v5-c-toggle-group__text"
                        >${msg("Forward auth (domain level)")}</span
                    >
                </button>
            </div>`;
    }

    renderSettings(): TemplateResult {
        switch (this.mode) {
            case ProxyMode.Proxy:
                return html`<p class="pf-v5-u-mb-xl">
                        ${msg(
                            "This provider will behave like a transparent reverse-proxy, except requests must be authenticated. If your upstream application uses HTTPS, make sure to connect to the outpost using HTTPS as well.",
                        )}
                    </p>
                    <ak-form-element-horizontal
                        label=${msg("External host")}
                        ?required=${true}
                        name="externalHost"
                    >
                        <input
                            type="text"
                            value="${ifDefined(this.instance?.externalHost)}"
                            class="pf-v5-c-form-control"
                            required
                        />
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "The external URL you'll access the application at. Include any non-standard port.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Internal host")}
                        ?required=${true}
                        name="internalHost"
                    >
                        <input
                            type="text"
                            value="${ifDefined(this.instance?.internalHost)}"
                            class="pf-v5-c-form-control"
                            required
                        />
                        <p class="pf-v5-c-form__helper-text">
                            ${msg("Upstream host that the requests are forwarded to.")}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal name="internalHostSslValidation">
                        <label class="pf-v5-c-switch">
                            <input
                                class="pf-v5-c-switch__input"
                                type="checkbox"
                                ?checked=${first(this.instance?.internalHostSslValidation, true)}
                            />
                            <span class="pf-v5-c-switch__toggle">
                                <span class="pf-v5-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-v5-c-switch__label"
                                >${msg("Internal host SSL Validation")}</span
                            >
                        </label>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg("Validate SSL Certificates of upstream servers.")}
                        </p>
                    </ak-form-element-horizontal>`;
            case ProxyMode.ForwardSingle:
                return html`<p class="pf-v5-u-mb-xl">
                        ${msg(
                            "Use this provider with nginx's auth_request or traefik's forwardAuth. Each application/domain needs its own provider. Additionally, on each domain, /outpost.goauthentik.io must be routed to the outpost (when using a manged outpost, this is done for you).",
                        )}
                    </p>
                    <ak-form-element-horizontal
                        label=${msg("External host")}
                        ?required=${true}
                        name="externalHost"
                    >
                        <input
                            type="text"
                            value="${ifDefined(this.instance?.externalHost)}"
                            class="pf-v5-c-form-control"
                            required
                        />
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "The external URL you'll access the application at. Include any non-standard port.",
                            )}
                        </p>
                    </ak-form-element-horizontal>`;
            case ProxyMode.ForwardDomain:
                return html`<p class="pf-v5-u-mb-xl">
                        ${msg(
                            "Use this provider with nginx's auth_request or traefik's forwardAuth. Only a single provider is required per root domain. You can't do per-application authorization, but you don't have to create a provider for each application.",
                        )}
                    </p>
                    <div class="pf-v5-u-mb-xl">
                        ${msg("An example setup can look like this:")}
                        <ul class="pf-v5-c-list">
                            <li>${msg("authentik running on auth.example.com")}</li>
                            <li>${msg("app1 running on app1.example.com")}</li>
                        </ul>
                        ${msg(
                            "In this case, you'd set the Authentication URL to auth.example.com and Cookie domain to example.com.",
                        )}
                    </div>
                    <ak-form-element-horizontal
                        label=${msg("Authentication URL")}
                        ?required=${true}
                        name="externalHost"
                    >
                        <input
                            type="text"
                            value="${first(this.instance?.externalHost, window.location.origin)}"
                            class="pf-v5-c-form-control"
                            required
                        />
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "The external URL you'll authenticate at. The authentik core server should be reachable under this URL.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Cookie domain")}
                        name="cookieDomain"
                        ?required=${true}
                    >
                        <input
                            type="text"
                            value="${ifDefined(this.instance?.cookieDomain)}"
                            class="pf-v5-c-form-control"
                            required
                        />
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "Set this to the domain you wish the authentication to be valid for. Must be a parent domain of the URL above. If you're running applications as app1.domain.tld, app2.domain.tld, set this to 'domain.tld'.",
                            )}
                        </p>
                    </ak-form-element-horizontal>`;
            case ProxyMode.UnknownDefaultOpenApi:
                return html`<p>${msg("Unknown proxy mode")}</p>`;
        }
    }

    renderForm(): TemplateResult {
        return html`<form class="pf-v5-c-form pf-m-horizontal">
            <ak-form-element-horizontal label=${msg("Name")} ?required=${true} name="name">
                <input
                    type="text"
                    value="${ifDefined(this.instance?.name)}"
                    class="pf-v5-c-form-control"
                    required
                />
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${msg("Authentication flow")}
                ?required=${false}
                name="authenticationFlow"
            >
                <ak-search-select
                    .fetchObjects=${async (query?: string): Promise<Flow[]> => {
                        const args: FlowsInstancesListRequest = {
                            ordering: "slug",
                            designation: FlowsInstancesListDesignationEnum.Authentication,
                        };
                        if (query !== undefined) {
                            args.search = query;
                        }
                        const flows = await new FlowsApi(DEFAULT_CONFIG).flowsInstancesList(args);
                        return flows.results;
                    }}
                    .renderElement=${(flow: Flow): string => {
                        return RenderFlowOption(flow);
                    }}
                    .renderDescription=${(flow: Flow): TemplateResult => {
                        return html`${flow.name}`;
                    }}
                    .value=${(flow: Flow | undefined): string | undefined => {
                        return flow?.pk;
                    }}
                    .selected=${(flow: Flow): boolean => {
                        return flow.pk === this.instance?.authenticationFlow;
                    }}
                >
                </ak-search-select>
                <p class="pf-v5-c-form__helper-text">
                    ${msg("Flow used when a user access this provider and is not authenticated.")}
                </p>
            </ak-form-element-horizontal>
            <ak-form-element-horizontal
                label=${msg("Authorization flow")}
                ?required=${true}
                name="authorizationFlow"
            >
                <ak-search-select
                    .fetchObjects=${async (query?: string): Promise<Flow[]> => {
                        const args: FlowsInstancesListRequest = {
                            ordering: "slug",
                            designation: FlowsInstancesListDesignationEnum.Authorization,
                        };
                        if (query !== undefined) {
                            args.search = query;
                        }
                        const flows = await new FlowsApi(DEFAULT_CONFIG).flowsInstancesList(args);
                        return flows.results;
                    }}
                    .renderElement=${(flow: Flow): string => {
                        return RenderFlowOption(flow);
                    }}
                    .renderDescription=${(flow: Flow): TemplateResult => {
                        return html`${flow.name}`;
                    }}
                    .value=${(flow: Flow | undefined): string | undefined => {
                        return flow?.pk;
                    }}
                    .selected=${(flow: Flow): boolean => {
                        return flow.pk === this.instance?.authorizationFlow;
                    }}
                >
                </ak-search-select>
                <p class="pf-v5-c-form__helper-text">
                    ${msg("Flow used when authorizing this provider.")}
                </p>
            </ak-form-element-horizontal>

            <div class="pf-v5-c-card pf-m-selectable pf-m-selected">
                <div class="pf-v5-c-card__body">
                    <div class="pf-v5-c-toggle-group">${this.renderModeSelector()}</div>
                </div>
                <div class="pf-v5-c-card__footer">${this.renderSettings()}</div>
            </div>
            <ak-form-element-horizontal label=${msg("Token validity")} name="accessTokenValidity">
                <input
                    type="text"
                    value="${first(this.instance?.accessTokenValidity, "hours=24")}"
                    class="pf-v5-c-form-control"
                />
                <p class="pf-v5-c-form__helper-text">
                    ${msg("Configure how long tokens are valid for.")}
                </p>
                <ak-utils-time-delta-help></ak-utils-time-delta-help>
            </ak-form-element-horizontal>

            <ak-form-group>
                <span slot="header">${msg("Advanced protocol settings")}</span>
                <div slot="body" class="pf-v5-c-form">
                    <ak-form-element-horizontal label=${msg("Certificate")} name="certificate">
                        <ak-search-select
                            .fetchObjects=${async (
                                query?: string,
                            ): Promise<CertificateKeyPair[]> => {
                                const args: CryptoCertificatekeypairsListRequest = {
                                    ordering: "name",
                                    hasKey: true,
                                    includeDetails: false,
                                };
                                if (query !== undefined) {
                                    args.search = query;
                                }
                                const certificates = await new CryptoApi(
                                    DEFAULT_CONFIG,
                                ).cryptoCertificatekeypairsList(args);
                                return certificates.results;
                            }}
                            .renderElement=${(item: CertificateKeyPair): string => {
                                return item.name;
                            }}
                            .value=${(item: CertificateKeyPair | undefined): string | undefined => {
                                return item?.pk;
                            }}
                            .selected=${(item: CertificateKeyPair): boolean => {
                                return item.pk === this.instance?.certificate;
                            }}
                            ?blankable=${true}
                        >
                        </ak-search-select>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal
                        label=${msg("Additional scopes")}
                        name="propertyMappings"
                    >
                        <select class="pf-v5-c-form-control" multiple>
                            ${this.propertyMappings?.results
                                .filter((scope) => {
                                    return !scope.managed?.startsWith("goauthentik.io/providers");
                                })
                                .map((scope) => {
                                    const selected = (this.instance?.propertyMappings || []).some(
                                        (su) => {
                                            return su == scope.pk;
                                        },
                                    );
                                    return html`<option
                                        value=${ifDefined(scope.pk)}
                                        ?selected=${selected}
                                    >
                                        ${scope.name}
                                    </option>`;
                                })}
                        </select>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg("Additional scope mappings, which are passed to the proxy.")}
                        </p>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg("Hold control/command to select multiple items.")}
                        </p>
                    </ak-form-element-horizontal>

                    <ak-form-element-horizontal
                        label="${this.mode === ProxyMode.ForwardDomain
                            ? msg("Unauthenticated URLs")
                            : msg("Unauthenticated Paths")}"
                        name="skipPathRegex"
                    >
                        <textarea class="pf-v5-c-form-control">
${this.instance?.skipPathRegex}</textarea
                        >
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "Regular expressions for which authentication is not required. Each new line is interpreted as a new expression.",
                            )}
                        </p>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "When using proxy or forward auth (single application) mode, the requested URL Path is checked against the regular expressions. When using forward auth (domain mode), the full requested URL including scheme and host is matched against the regular expressions.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
            <ak-form-group>
                <span slot="header">${msg("Authentication settings")}</span>
                <div slot="body" class="pf-v5-c-form">
                    <ak-form-element-horizontal name="interceptHeaderAuth">
                        <label class="pf-v5-c-switch">
                            <input
                                class="pf-v5-c-switch__input"
                                type="checkbox"
                                ?checked=${first(this.instance?.interceptHeaderAuth, true)}
                            />
                            <span class="pf-v5-c-switch__toggle">
                                <span class="pf-v5-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-v5-c-switch__label"
                                >${msg("Intercept header authentication")}</span
                            >
                        </label>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "When enabled, authentik will intercept the Authorization header to authenticate the request.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    <ak-form-element-horizontal name="basicAuthEnabled">
                        <label class="pf-v5-c-switch">
                            <input
                                class="pf-v5-c-switch__input"
                                type="checkbox"
                                ?checked=${first(this.instance?.basicAuthEnabled, false)}
                                @change=${(ev: Event) => {
                                    const el = ev.target as HTMLInputElement;
                                    this.showHttpBasic = el.checked;
                                }}
                            />
                            <span class="pf-v5-c-switch__toggle">
                                <span class="pf-v5-c-switch__toggle-icon">
                                    <i class="fas fa-check" aria-hidden="true"></i>
                                </span>
                            </span>
                            <span class="pf-v5-c-switch__label"
                                >${msg("Send HTTP-Basic Authentication")}</span
                            >
                        </label>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "Send a custom HTTP-Basic Authentication header based on values from authentik.",
                            )}
                        </p>
                    </ak-form-element-horizontal>
                    ${this.showHttpBasic ? this.renderHttpBasic() : html``}
                    <ak-form-element-horizontal
                        label=${msg("Trusted OIDC Sources")}
                        name="jwksSources"
                    >
                        <select class="pf-v5-c-form-control" multiple>
                            ${this.oauthSources?.results.map((source) => {
                                const selected = (this.instance?.jwksSources || []).some((su) => {
                                    return su == source.pk;
                                });
                                return html`<option value=${source.pk} ?selected=${selected}>
                                    ${source.name} (${source.slug})
                                </option>`;
                            })}
                        </select>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg(
                                "JWTs signed by certificates configured in the selected sources can be used to authenticate to this provider.",
                            )}
                        </p>
                        <p class="pf-v5-c-form__helper-text">
                            ${msg("Hold control/command to select multiple items.")}
                        </p>
                    </ak-form-element-horizontal>
                </div>
            </ak-form-group>
        </form>`;
    }
}
