export default {
  name:'onlineTpl',
  data() {
    return{
      pageData:{
        //查询表单内容 start
        searchForm:[
					{type:'Input',label:'文档名称',prop:'tplName'},
        ],
        //查询表单内容 end
        //查询条件 start
        queryData:{
					tplName:"",//文档名称 
        },
        //查询条件 end
        //查询表单按钮start
        searchHandle:[
          {label:'查询',type:'primary',handle:()=>this.searchtablelist(),auth:'onlineTpl_search'},
          {label:'重置',type:'warning',handle:()=>this.resetSearch(),auth:'onlineTpl_search'}
        ],
        //查询表单按钮end
        //表格数据start
        lazy:true,
        tableData:[],
        //表格数据end
        //表格工具栏按钮 start
        tableHandles:[
          {label:'新建目录',type:'primary',handle:()=>this.showModal(this.commonConstants.modalType.insert,null,'1'),auth:'onlineTpl_folder'},
          {label:'新建文档',type:'warning',handle:()=>this.showModal(this.commonConstants.modalType.insert,null,'2'),auth:'onlineTpl_insert'},
          {label:'刷新',type:'danger',handle:()=>this.searchtablelist(),auth:'onlineTpl_search'},
        ],
        //表格工具栏按钮 end
        selectList:[],//表格选中的数据
        //表格分页信息start
        tablePage:{
          currentPage: 1,
          pageSize:10,
          pageTotal: 0,
          pageSizeRange:[5, 10, 20, 50]
        },
        //表格分页信息end
        //表格列表头start
        tableCols:[
					{label:'文档名称',prop:'tplName',align:'left',icon:true},
					{label:'操作',prop:'operation',align:'center',type:'button',btnList:[
						{label:'查看',type:'primary',auth:'onlineTpl_getDetai',handle:(row)=>this.showModal(this.commonConstants.modalType.detail,row.id),show:(row)=>this.isShowBtn(row)},
						{label:'编辑',type:'primary',auth:'onlineTpl_update',handle:(row)=>this.showModal(this.commonConstants.modalType.update,row.id,row.type)},
            {label:'编辑文档',type:'primary',auth:'onlineTpl_editDoc',handle:(row)=>this.routerTo(row),show:(row)=>this.isShowBtn(row)},
						{label:'删除',type:'primary',auth:'onlineTpl_delete',handle:(row)=>this.deleteOne(row.id,row.type)},
					]}
        ],
        //表格列表头end
        //modal配置 start
        modalConfig:{ 
          title: "新增", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'700px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        //modal配置 end
        //modal表单 start
        modalForm:[
					{type:'Input',label:'文档名称',prop:'tplName',rules:{required:true,maxLength:40}},
          {type:'Select',label:'数据加载方式',prop:'dataLoadType',rules:{required:true},rules:{required:true},options:this.selectUtil.dataLoadType},
          {type:'Select',label:'所属目录',prop:'reportType',rules:{required:true},props:{label:'reportTypeName',value:'id'}},
        ],
        //modal表单 end
        //modal 数据 start
        modalData : {//modal页面数据
					tplName:"",//文档名称 
          dataLoadType:"",
          reportType:"",
        },
        //modal 数据 end
        //modal 按钮 start
        modalHandles:[
          {label:'取消',type:'default',handle:()=>this.closeModal()},
          {label:'提交',type:'primary',handle:()=>this.save()}
        ],
        //modal 按钮 end
        folderModalConfig:{ 
          title: "新增文件夹", //弹窗标题,值为:新增，查看，编辑
          show: false, //弹框显示
          formEditDisabled:false,//编辑弹窗是否可编辑
          width:'700px',//弹出框宽度
          modalRef:"modalRef",//modal标识
          type:"1"//类型 1新增 2编辑 3保存
        },
        //modal配置 end
        //modal表单 start
        folderModalForm:[
					{type:'Input',label:'目录名称',prop:'reportTypeName',rules:{required:true,maxLength:50}},
        ],
        //modal表单 end
        //modal 数据 start
        folderModalData : {//modal页面数据
					reportTypeName:"",//类型名称
        },
        //modal 数据 end
        //modal 按钮 start
        folderModalHandles:[
          {label:'取消',type:'default',handle:()=>this.closeFolderModal()},
          {label:'提交',type:'primary',handle:()=>this.saveFolder()}
        ],
      }
    }
  },
  mounted(){
    this.pageData.tableData = [];
    this.searchtablelist();
    this.getReportType();
  },
  methods:{
    /**
     * @description: 获取表格数据
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    searchtablelist(){
      var obj = {
        url:this.apis.onlineTpl.listApi,
        params:Object.assign({}, this.pageData.queryData, this.pageData.tablePage),
      }
      var that = this;
      that.pageData.tableData = []
      this.commonUtil.getTableList(obj).then(response=>{
        that.pageData.tableData = response.responseData
        that.getReportType();
      });
    },
    resetSearch(){
      this.commonUtil.clearObj(this.pageData.queryData);
      this.searchtablelist();
    },
    /**
     * @description: modal显示
     * @param {type} 类型 1新增，2编辑 3详情 
     * @param {id} 数据唯一标识
     * @return: 
     * @author: caiyang
     */    
    showModal(type,id,docType){
      this.commonUtil.showModal(docType=="1"?this.pageData.folderModalConfig:this.pageData.modalConfig,type);
      if(type == this.commonConstants.modalType.insert){
        docType=="1"?this.pageData.folderModalConfig.title = "新增目录":this.pageData.modalConfig.title = "新增文档"
      }else{
        docType=="1"?this.pageData.folderModalConfig.title = "编辑目录":this.pageData.modalConfig.title = "编辑文档"
      }
      if(type != this.commonConstants.modalType.insert)
      {
        this.getDetail(id,docType);
      }
      
    },
    /**
     * @description: 获取详细数据
     * @param {id} 数据唯一标识
     * @return: 
     * @author: caiyang
     */    
    getDetail(id,docType){
      var obj = {
        url:docType=="1"?this.apis.reportType.getDetailApi:this.apis.onlineTpl.getDetailApi,
        params:{id:id},
      }
      this.commonUtil.doGet(obj).then(response=>{
        if(response.responseData.reportType == 0){
          response.responseData.reportType = null;
        }
        this.commonUtil.coperyProperties(docType=="1"?this.pageData.folderModalData:this.pageData.modalData,response.responseData);//数据赋值
      });
    },
    /**
     * @description: 关闭modal
     * @param 
     * @return: 
     * @author: caiyang
     */    
    closeModal(){
      this.$refs['modalRef'].$refs['modalFormRef'].resetFields();//校验重置
      this.pageData.modalConfig.show = false;//关闭modal
      this.commonUtil.clearObj(this.pageData.modalData);//清空modalData
    },
    closeFolderModal(){
      this.$refs['folderModalRef'].$refs['modalFormRef'].resetFields();//校验重置
      this.pageData.folderModalConfig.show = false;//关闭modal
      this.commonUtil.clearObj(this.pageData.folderModalData);//清空modalData
    },
    /**
     * @description: 保存数据
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    save(){
      this.$refs['modalRef'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
            var obj = {
              params:this.pageData.modalData,
              removeEmpty:false,
            }
            if(this.pageData.modalConfig.type == this.commonConstants.modalType.insert)
            {
              obj.url = this.apis.onlineTpl.insertApi;
            }else{
              obj.url = this.apis.onlineTpl.updateApi
            }
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                this.closeModal();
                this.searchtablelist();
              }
            });
        }else{
            return false;
        }
      });
    },
    saveFolder(){
      this.$refs['folderModalRef'].$refs['modalFormRef'].validate((valid) => {
        if (valid) {
           this.pageData.folderModalData.type = 3
            var obj = {
              params:this.pageData.folderModalData,
              removeEmpty:false,
            }
            if(this.pageData.folderModalConfig.type == this.commonConstants.modalType.insert)
            {
              obj.url = this.apis.reportType.insertApi;
            }else{
              obj.url = this.apis.reportType.updateApi
            }
            this.commonUtil.doPost(obj) .then(response=>{
              if (response.code == "200")
              {
                this.closeFolderModal();
                this.searchtablelist();
                this.getReportType();
              }
            });
        }else{
            return false;
        }
      });
    },
    /**
     * @description: 删除一条数据
     * @param {id} 数据唯一标识 
     * @return: 
     * @author: caiyang
     */    
    deleteOne(id,type){
      let obj = {
        url:this.apis.onlineTpl.deleteOneApi,
        messageContent:this.commonUtil.getMessageFromList("confirm.delete",null),
        callback:this.searchtablelist,
        params:{id:id},
        type:"get",
      }
      if(type == 1){
        obj.url = this.apis.reportType.deleteOneApi;
        //删除前确认是否有文件，如果有文件则不允许删除
        var checkObj = {
          params:{reportType:id},
          url:this.apis.onlineTpl.getChildrenApi
        }
        this.commonUtil.doPost(checkObj) .then(response=>{
          if (response.code == "200")
          {
            if(response.responseData && response.responseData.length > 0){
              this.commonUtil.showMessage({message:"该目录下有文档，不允许删除！",type: this.commonConstants.messageType.error});
            }else{
              //弹出删除确认框
              this.commonUtil.showConfirm(obj)
            }
          }
        });
      }else{
        //弹出删除确认框
        this.commonUtil.showConfirm(obj)
      }
    },
    /**
     * @description: 批量删除
     * @param {type} 
     * @return: 
     * @author: caiyang
     */    
    deleteBatch(){
        const length = this.pageData.selectList.length;
        if(length == 0)
        {
            this.commonUtil.showMessage({message:this.commonUtil.getMessageFromList("error.batchdelete.empty",null),type: this.commonConstants.messageType.error});
        }else{
          let ids = new Array();
          for (let i = 0; i < length; i++) {
              ids.push(this.pageData.selectList[i].id);
          }
          let obj = {
            url:this.apis.onlineTpl.deleteBatchApi,
            messageContent:this.commonUtil.getMessageFromList("confirm.delete",null),
            callback:this.searchtablelist,
            params:ids,
            type:"post",
          }
          this.commonUtil.showConfirm(obj);
        }
    },
    selectChange(rows){
      this.pageData.selectList = rows;
    },
    routerTo(row){
      let viewReport = this.$router.resolve({ name: 'coedit',query: {gridKey:row.listId,isLoadALL:row.dataLoadType}});
      window.open(viewReport.href, '_blank');
    },
    loadData(tree, treeNode, resolve){
      var obj = {
        params:{reportType:tree.id},
        url:this.apis.onlineTpl.getChildrenApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          resolve(response.responseData)
        }
      });
    },
    isShowBtn(row){
      if(row.type == "1"){
        return false;
      }else {
        return true;
      }
    },
    //获取报表类型
    getReportType(){
      var obj = {
        params:{type:3},
        url:this.apis.reportType.getReportTypeApi
      }
      this.commonUtil.doPost(obj) .then(response=>{
        if (response.code == "200")
        {
          this.pageData.modalForm[2].options = response.responseData;
        }
      });
    },
  }
};