import {showToast, ToastStyle} from "@raycast/api";
import {ISite} from "../Site";
import {camelCase, mapKeys, sortBy} from "lodash";
import {ServerInterface} from "../Server";
import {PLOI_API_URL} from "../config";
import axios from "axios";

export const Site = {
    async getAll(server: ServerInterface) {
        try {
            const response = await axios.get(`${PLOI_API_URL}/servers/${server.id}/sites`);
            const siteData = (await response.data) as Sites;
            let sites = siteData?.data ?? [];

            // eslint-disable-next-line
            // @ts-ignore Not sure how to convert Dictionary from lodash to IServer
            sites = sites.map((s) => mapKeys(s, (_, k) => camelCase(k)) as ISite);
            return sortBy(sites, "domain") as ISite[];
        } catch (error: unknown) {
            await showToast(ToastStyle.Failure, (error as ErrorEvent).message);
            return;
        }
    },

    async get(site: ISite, server: ServerInterface) {
        try {

            const response = await axios.get(`${PLOI_API_URL}/servers/${server.id}/sites/${site.id}`);
            const siteData = (await response.data) as ISite;
            // eslint-disable-next-line
            // @ts-ignore Not sure how to convert Dictionary from lodash to IServer
            return mapKeys(siteData?.data ?? [], (_, k) => camelCase(k)) as ISite;
        } catch (error: unknown) {
            await showToast(ToastStyle.Failure, (error as ErrorEvent).message);
            return;
        }
    },

    async deploy(site: ISite, server: ServerInterface) {
        try {
            await axios.post(`${PLOI_API_URL}/servers/${server.id}/sites/${site.id}/deploy`);
            await showToast(ToastStyle.Success, `Deploying ${site.domain}`);
        } catch (error: unknown) {
            await showToast(ToastStyle.Failure, (error as ErrorEvent).message);
            return;
        }
    },

    async flushFastCgiCache(site: ISite, server: ServerInterface) {
        try {
            await axios.post(`${PLOI_API_URL}/servers/${server.id}/sites/${site.id}/fastcgi-cache/flush`);
            await showToast(ToastStyle.Success, `Flushing FastCGI Cache`);
        } catch (error: unknown) {
            if (error.response.status === 422 && error.response.data && error.response.data.errors[0]) {
                await showToast(ToastStyle.Failure, error.response.data.errors[0]);
                return;
            }

            await showToast(ToastStyle.Failure, (error as ErrorEvent).message);
            return;
        }
    },
};

type Sites = {
    data: ISite[];
};
