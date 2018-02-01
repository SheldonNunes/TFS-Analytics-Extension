import { TeamContext } from "VSS/Common/Contracts/Platform";
import { WorkItemTrackingHttpClient4, getClient } from "TFS/WorkItemTracking/RestClient";

export class TFSProcessConfigurationRetriever {
    private _httpClient: WorkItemTrackingHttpClient4;
    public get httpClient(): WorkItemTrackingHttpClient4 {
        if (!this._httpClient) {

            this._httpClient = getClient();
        }
        return this._httpClient;
    }

    public getProjectProcessConfiguration(projectId){
        this.httpClient.getWorkItemTypes(projectId).then(function(result){

        });
    }
}