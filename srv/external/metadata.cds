@cds.external : true
@m.IsDefaultEntityContainer : 'true'
@sap.message.scope.supported : 'true'
@sap.supported.formats : 'atom json xlsx'

service ODataService {   //Expose as ODataService
    entity Programs as projection on metadata.Programs;
}


@cds.persistence.skip : true
@sap.creatable : 'false'
@sap.updatable : 'false'
@sap.deletable : 'false'
@sap.content.version : '1'
@sap.label : 'ABAP Report Programs from TADIR'
entity metadata.Programs {
  @sap.display.format : 'UpperCase'
  @sap.label : 'Object Name'
  @sap.quickinfo : 'Object Name in Object Directory'
  key ProgramName : String(40) not null;
  @sap.display.format : 'UpperCase'
  @sap.label : 'Package'
  DevClass : String(30);
  @sap.display.format : 'UpperCase'
  @sap.label : 'Person Responsible'
  @sap.quickinfo : 'Person Responsible for a Repository Object'
  Author : String(12);
  @Core.MediaType : 'text/plain'
  ProgramSourceCode : LargeBinary;
};
