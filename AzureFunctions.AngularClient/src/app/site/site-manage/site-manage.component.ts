import { FeatureGroup } from './../../feature-group/feature-group';
import { OpenBrowserWindowFeature, DisabledDynamicBladeFeature } from './../../feature-group/feature-item';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {ArmService} from '../../shared/services/arm.service';
import {RBACService} from '../../shared/services/rbac.service';
import {PortalService} from '../../shared/services/portal.service';
import {Site} from '../../shared/models/arm/site';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {SiteDescriptor} from '../../shared/resourceDescriptors';
import {PopOverComponent} from '../../pop-over/pop-over.component';
import {FeatureGroupComponent} from '../../feature-group/feature-group.component';
import {FeatureItem, RBACFeature, RBACBladeFeature, TabFeature, BladeFeature, ResourceUriBladeFeature} from '../../feature-group/feature-item';
import {WebsiteId} from '../../shared/models/portal';

@Component({
    selector: 'site-manage',
    templateUrl: './site-manage.component.html',
    styleUrls: ['../site-dashboard/site-dashboard.component.scss'],
    inputs: ["siteInput"]
})

export class SiteManageComponent {
    public groups1 : FeatureGroup[]; 
    public groups2 : FeatureGroup[];
    public groups3 : FeatureGroup[];

    public searchTerm = "";
    private _siteSub = new Subject<ArmObj<Site>>();
    private _descriptor : SiteDescriptor;

    @Output() openTabEvent = new Subject<string>();

    set siteInput(site : ArmObj<Site>){
        this._siteSub.next(site);
    }

    constructor(private _rbacService : RBACService, private _portalService : PortalService){
        this._siteSub
        .distinctUntilChanged()
        .switchMap(site =>{
            this._portalService.closeBlades();

            this._descriptor = new SiteDescriptor(site.id);

            this._initCol1Groups(site);
            this._initCol2Groups(site);
            this._initCol3Groups(site);

            let loadObs : Observable<any>[] = [];
            this._getLoadObservables(this.groups1, loadObs);
            this._getLoadObservables(this.groups2, loadObs);
            this._getLoadObservables(this.groups3, loadObs);

            return Observable.zip.apply(null, loadObs);
        })
        .subscribe(results =>{
            
        });
    }

    ngOnDestroy() {
        this._portalService.closeBlades();
    }

    private _getLoadObservables(groups : FeatureGroup[], observables : Observable<any>[]){
        groups.forEach(group =>{
            group.features.forEach(feature =>{
                observables.push(feature.load());
            })
        })
    }

    private _initCol1Groups(site : ArmObj<Site>){
        let codeDeployFeatures = [
            new BladeFeature(
                "Deployment source",
                "continuous deployment source github bitbucket dropbox onedrive vsts visual studio code vso",
                "Deployment source info",
                "images/deployment-source.svg",
                {
                        detailBlade : "ContinuousDeploymentListBlade",
                        detailBladeInputs : {
                            id : this._descriptor.resourceId,
                            ResourceId : this._descriptor.resourceId
                        }
                },
                this._portalService),

            new BladeFeature(
                "Deployment credentials",
                "deployment credentials",
                "Info",
                "images/deployment-credentials.svg",
                {
                    detailBlade : "FtpCredentials",
                    detailBladeInputs :{
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)            
        ];

        let developmentToolFeatures = [
            new ResourceUriBladeFeature(
                "Console",
                "console debug",
                "Info",
                "images/console.svg",
                site.id,
                "ConsoleBlade",
                this._portalService), 
           
            new OpenKuduFeature(site),

            new OpenEditorFeature(site), 

            new OpenResourceExplorer(),

            // Slots are not available yet
            // new DisabledDynamicBladeFeature(
            //     "Test in production",
            //     "Test in production",
            //     "Info",
            //     site.properties.sku,
            //     {
            //         detailBlade : "WebsiteRoutingRulesBlade",
            //         detailBladeInputs : {
            //             WebsiteId : this._descriptor.getWebsiteId()
            //         }
            //     },
            //     this._portalService),

            new DisabledDynamicBladeFeature(
                "Extensions",
                "Extensions",
                "Info",
                "images/extensions.svg",
                site.properties.sku,                
                {
                    detailBlade : "SiteExtensionsListBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService)

        ]

        let generalFeatures = [
            new ResourceUriBladeFeature(
                "Application settings",
                "application settings connection strings java php .net",
                "Info",
                "images/application-settings.svg",
                site.id,
                "WebsiteConfigSiteSettings",
                this._portalService),   

            new BladeFeature(
                "Properties",
                "properties",
                "Info",
                "images/properties.svg",
                {
                    detailBlade : "PropertySheetBlade",
                    detailBladeInputs : {
                        resourceId : this._descriptor.resourceId,
                    }
                },
                this._portalService), 

            new DisabledDynamicBladeFeature(
                "Web jobs",
                "web jobs",
                "Info",
                "images/webjobs.svg",
                site.properties.sku,
                {
                    detailBlade : "webjobsNewBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService),

            new DisabledDynamicBladeFeature(
                "Backups",
                "backups",
                "Info",
                "images/backups.svg",
                site.properties.sku,
                {
                    detailBlade : "Backup",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService),

            new BladeFeature(
                "All settings",
                "all settings",
                "Info",
                "images/webapp.svg",
                {
                    detailBlade : "WebsiteBlade",
                    detailBladeInputs : {
                        id : site.id
                    }
                },
                this._portalService)
        ]

        this.groups1 = [
            new FeatureGroup("Code deployment", codeDeployFeatures),
            new FeatureGroup("Development tools", developmentToolFeatures),
            new FeatureGroup("General settings", generalFeatures)];
    }

    private _initCol2Groups(site : ArmObj<Site>){
        
        let networkFeatures = [
            new DisabledDynamicBladeFeature(
                "Networking",
                "networking",
                "Info",
                "images/networking.svg",
                site.id,
                {
                    detailBlade : "NetworkSummaryBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService),

            new BladeFeature(
                "SSL",
                "ssl",
                "Info",
                "images/ssl.svg",
                {
                    detailBlade : "CertificatesBlade",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                    }
                },
                this._portalService),

            new BladeFeature(
                "Custom domains",
                "custom domains",
                "Info",
                "images/custom-domains.svg",
                {                
                    detailBlade : "CustomDomainsAndSSL",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                        BuyDomainSelected : false
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Authentication / Authorization",
                "authentication authorization aad google facebook microsoft",
                "Info",
                "images/authentication.svg",
                site.id,
                "AppAuth",
                this._portalService),

            new BladeFeature(
                "Push notifications",
                "push",
                "Info",
                "images/push.svg",
                {
                    detailBlade : "PushRegistrationBlade",
                    detailBladeInputs : {
                        resourceUri : this._descriptor.resourceId,
                    }
                },
                this._portalService),
        ]

        let monitoringFeatures = [
            new BladeFeature(
                "Diagnostic logs",
                "diagnostic logs",
                "Info",
                "images/diagnostic-logs.svg",
                {
                    detailBlade : "WebsiteLogsBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId()
                    }
                },
                this._portalService),

            new ResourceUriBladeFeature(
                "Log streaming",
                "log streaming",
                "Info",
                "images/log-stream.svg",
                site.id,
                "LogStreamBlade",
                this._portalService),

            new ResourceUriBladeFeature(
                "Process Explorer",
                "process explorer",
                "Info",
                "images/process-explorer.svg",
                site.id,
                "ProcExpNewBlade",
                this._portalService),            

            new BladeFeature(
                "Security scanning",
                "security scanning tinfoil",
                "Info",
                "images/tinfoil-flat-21px.png",
                {
                    detailBlade : "TinfoilSecurityBlade",
                    detailBladeInputs : {
                        WebsiteId : this._descriptor.getWebsiteId(),
                    }
                },
                this._portalService),
        ]

        this.groups2 = [
            new FeatureGroup("Networking", networkFeatures),
            new FeatureGroup("Monitoring", monitoringFeatures)];
    }

    private _initCol3Groups(site : ArmObj<Site>){
        let apiManagementFeatures = [
            new ResourceUriBladeFeature(
                "CORS",
                "cors api",
                "Info",
                "images/cors.svg",
                site.id,
                "ApiCors",
                this._portalService),

            new ResourceUriBladeFeature(
                "API Definition",
                "api definition swagger",
                "Info",
                "images/api-definition.svg",
                site.id,
                "ApiDefinition",
                this._portalService),            
        ]

        let appServicePlanFeatures = [
            new RBACBladeFeature(
                "App Service plan",
                "app service plan scale",
                "Info",
                "images/app-service-plan.svg",
                site.properties.serverFarmId,
                ["./read"],
                "You do not have read permissions for the associated plan",
                this._rbacService,
                {
                    detailBlade : "WebHostingPlanBlade",
                    detailBladeInputs : {
                        id : site.properties.serverFarmId
                    }
                },
                this._portalService),

            new DisabledDynamicBladeFeature(
                "Quotas",
                "quotas",
                "Info",
                "images/quotas.svg",
                site.properties.sku,
                {
                    detailBlade : "QuotasBlade",
                    detailBladeInputs : {
                        resourceUri : site.id
                    }
                },
                this._portalService),
        ]

        let resourceManagementFeatures = [
            new BladeFeature(
                "Activity log",
                "activity log events",
                "Info",
                "images/activity-log.svg",
                {
                    detailBlade : "EventsBrowseBlade",
                    detailBladeInputs : {
                        id : site.id
                    },
                    extension : "Microsoft_Azure_Monitoring"
                },
                this._portalService
            ),

            new BladeFeature(
                "Access control (IAM)",
                "access control rbac",
                "Info",
                "images/access-control.svg",
                {
                    detailBlade : "UserAssignmentsV2Blade",
                    detailBladeInputs : {
                        scope : site.id
                    },
                    extension : "Microsoft_Azure_AD"
                },
                this._portalService
            ),            

            new BladeFeature(
                "Tags",
                "tags",
                "Info",
                "images/tags.svg",
                {
                    detailBlade : "ResourceTagsListBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService
            ),        

            new BladeFeature(
                "Locks",
                "locks",
                "Info",
                "images/locks.svg",
                {
                    detailBlade : "LocksBlade",
                    detailBladeInputs : {
                        resourceId : site.id
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

            // new NotImplementedFeature("Clone app", "clone app", "Info"),  // TODO: ellhamai - Need to implent

            new BladeFeature(
                "Automation script",
                "export template arm azure resource manager api",
                "Info",
                "images/automation-script.svg",
                {
                    detailBlade : "TemplateViewerBlade",
                    detailBladeInputs : {
                        options: {
                            resourceGroup : `/subscriptions/${this._descriptor.subscription}/resourcegroups/${this._descriptor.resourceGroup}`,
                            telemetryId : "Microsoft.Web/sites"
                        },
                        stepOutput: null
                    },
                    extension : "HubsExtension"
                },
                this._portalService),

            // new NotImplementedFeature(  // TODO: ellhamai - Need to implement
            //     "New support request",
            //     "support request",
            //     "Info"),
        ]

        this.groups3 = [
            new FeatureGroup("APIs", apiManagementFeatures),
            new FeatureGroup("App Service Plan", appServicePlanFeatures),
            new FeatureGroup("Resource management", resourceManagementFeatures)];
    }

    openTab(tabName : string){
        this.openTabEvent.next(tabName);
    }
}

export class OpenKuduFeature extends FeatureItem{
        constructor(private _site : ArmObj<Site>){
        super("Advanced tools", "kudu advanced tools", "Info", "images/advanced-tools.svg");
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}`);
    }
}

export class OpenEditorFeature extends FeatureItem{
        constructor(private _site : ArmObj<Site>){

        super("App service editor", "app service editor visual studio online", "Info", "images/appsvc-editor.svg");
    }

    click(){
        let scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
        window.open(`https://${scmHostName}/dev`);
    }
}

export class OpenResourceExplorer extends FeatureItem{
        constructor(){
        super("Resource Explorer", "resource explorer", "Info", "images/resource-explorer.svg");
    }

    click(){
        window.open("https://resources.azure.com")
    }
}

export class NotImplementedFeature extends FeatureItem{
        constructor(
        title : string,
        keywords : string,
        info : string){

        super(title, keywords, info);
    }

    click(){
        alert("Not implemented");
    }
}