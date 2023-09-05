import { CoreApi, CoreRbacObjectUserListModelEnum, UserObjectPermission } from "@goauthentik/api";
import { DEFAULT_CONFIG } from "@goauthentik/app/common/api/config";
import { PaginatedResponse, Table, TableColumn } from "@goauthentik/app/elements/table/Table";
import { TemplateResult, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("ak-rbac-object-permission-table")
export class ObjectPermissionTable extends Table<UserObjectPermission> {
    @property()
    model?: CoreRbacObjectUserListModelEnum;

    @property()
    objectPk?: string | number;

    apiEndpoint(page: number): Promise<PaginatedResponse<UserObjectPermission>> {
        return new CoreApi(DEFAULT_CONFIG).coreRbacObjectUserList({
            page: page,
            model: this.model,
            objectPk: this.objectPk?.toString(),
        });
    }
    columns(): TableColumn[] {
        return [
            new TableColumn("Permission", "permission"),
            new TableColumn("User", "user"),
        ];
    }
    row(item: UserObjectPermission): TemplateResult[] {
        return [
            html`${item.permission.name}`,
            html`${item.user.username}`,
        ];
    }

}
