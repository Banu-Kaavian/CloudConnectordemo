using { ODataService } from '../db/schema';

service CatalogService @(path:'/odata/v4/catalog') {

    entity Services as projection on ODataService.CatalogService;

    entity Metadata as projection on ODataService.EntityMetadata;
    
    entity EntityData as projection on ODataService.DataEntity;
}
