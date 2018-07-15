(function () {
    'use strict';

    angular
    .module('colecionavel.module.item')
    .controller('ItemListarController', ItemListarController);

    ItemListarController.$inject = ['$scope','ItemService','ItemFactory','$state','UserService','$uibModal', 'GENERO', 'PLATAFORMA', 'REGIAO', 'SITUACAO', 'TIPO', 'ScrollToService'];


    function ItemListarController($scope, ItemService,ItemFactory,$state,UserService,$uibModal, GENERO, PLATAFORMA, REGIAO, SITUACAO, TIPO, ScrollToService) {
        //Atributos
        var vm = this;
        vm.titulo = "Listagem do Proprietário";  
        vm.itens = [];
        vm.item = {
			plataforma : [],
			genero : [], 
            regiao : [], 
            tipo : [], 
            situacao : [],			
			status: []			
		};
        vm.maxSize = 3;
        vm.totalItems = 0;
        vm.currentPage = 1;
        vm.item.registrosPorPagina = "5";
        vm.selectTop = ["5","10","30","50"];
        vm.order = 'titulo';
        vm.sort = true;
        vm.animationsEnabled = true;
        vm.generos = [];
        vm.plataformas = [];
        vm.regioes = [];
        vm.situacoes = [];
        vm.tipos = [];      
		vm.dropdownSettings = { 
				checkBoxes: true, 
				dynamicTitle: true, 
				showUncheckAll: true, 
				showCheckAll: false 
		};
		
		vm.statusList = [ {id: "C", label: "Completo"},
							  {id: "P", label: "Pendente"}, 
							  {id: "E", label: "Em Progressão"}]; 		
		
        
        //Instancia Metodos
        vm.findByFilter = findByFilter;
        vm.atualizar = atualizar;
        vm.remover = remover;
        vm.visualizar = visualizar;
        vm.registrosPorPaginaAlterados = registrosPorPaginaAlterados;
        vm.pesquisar = pesquisar;
        vm.sorter = sorter;
        vm.sorterIconCheck = sorterIconCheck;
        vm.limparCampos = limparCampos;
        vm.modalExcluir = modalExcluir;   
        vm.montarFiltro = montarFiltro; 
        vm.topoPagina = topoPagina;

        function limparCampos(){
            vm.item = {
                registrosPorPagina : "5"
            };
            ItemFactory.setPesquisa(undefined);
            activate();
        }
        

        //Metodos
        function sorter(ordem){
            vm.sort = !vm.sort;
            vm.order = ordem;
            vm.findByFilter(vm.currentPage,vm.item.registrosPorPagina,vm.item,vm.order,vm.sort);
        }

        function sorterIconCheck(coluna){
            if(coluna === vm.order && vm.sort === true){
                return 'sorting_asc';
            }else if(coluna === vm.order && vm.sort === false){
                return 'sorting_desc';
            }else{
                return 'sorting';
            }
        }

        function pesquisar(){
            ItemFactory.setPesquisa(vm.item);
            vm.findByFilter(vm.currentPage,vm.item.registrosPorPagina,vm.item,vm.order,vm.sort);
        }
        
        function registrosPorPaginaAlterados(){
            vm.findByFilter(vm.currentPage,vm.item.registrosPorPagina,vm.item,vm.order,vm.sort);
        }

        vm.setPage = function (pageNo) {
            vm.currentPage = pageNo;
        };

        vm.pageChanged = function() {
            vm.findByFilter(vm.currentPage,vm.item.registrosPorPagina,vm.item,vm.order,vm.sort);
        };

        
        function activate() {
            var objeto = ItemFactory.getPesquisa();
            if (!angular.isUndefined(objeto)) {
              vm.item = objeto;  
              switch(vm.item.registrosPorPagina){
                 case '12':
                    vm.item.registrosPorPagina = "5";
                 break;
                 case '18':
                    vm.item.registrosPorPagina = "10";
                 break;
                 case '24':
                    vm.item.registrosPorPagina = "30";
                 break;
                 case '48':
                    vm.item.registrosPorPagina = "50";
                 break;
                 case '9999':
                    vm.item.registrosPorPagina = "9999";
                 break;
              }                            
            } 
            vm.findByFilter(vm.currentPage,vm.item.registrosPorPagina,vm.item,vm.order,vm.sort);
            vm.montarFiltro();
        }

        function visualizar (objeto) {
        objeto.isView = true;
        ItemFactory.setItem(objeto);
            $state.go('item-manter');              
        }    

        function atualizar(objeto){
            objeto.isView = false;
            ItemFactory.setItem(objeto);
            $state.go('item-manter');
        }

        function remover(codigo){
            //console.log('Voce excluiu o '+codigo)
            addloader();
            ItemService.remove(codigo).then(function onSuccess(response) {
                console.log(response.data);
                removeloader();
                activate();
            }).catch(function onError(response) {
                removeloader();
                console.log(response);
            });
        }


        function findByFilter(skipIn, takeIn, pesquisa, order, sort) {
            addloader();
            ItemService.findByFilter(skipIn, parseInt(takeIn),pesquisa, order, sort).then(function onSuccess(response) {
                if(response.headers('X-Total-Registros') !== null && !angular.isUndefined(response.headers('X-Total-Registros'))){
                    vm.totalItems = parseInt(response.headers('X-Total-Registros'));
                }
                vm.itens = ItemFactory.convertList(response.data);
                removeloader();     
                ScrollToService.scrollToId('topo');           
            }).catch(function onError(response) {
                console.log(response);
                UserService.checkStatus(response);
                removeloader();
                ScrollToService.scrollToTop( 0, 600);
            });
        };


        function ordenar(dados) {
            dados.sort(function (a, b) {
                if(a > b){
                    return 1;
                }else{
                    return -1;
                }
            });
            return dados;
        }


        function montarFiltro() {
            ItemService.findAll().then(function onSuccess(response) {
                if(response !== null && !angular.isUndefined(response) && !angular.isUndefined(response.data)){
                    for (var i = 0; i < response.data.length; i++) {
                         if(GENERO.lista.includes(response.data[i].genero) === true && 
                            vm.generos.includes(response.data[i].genero) === false){
                            vm.generos.push(response.data[i].genero);
                         }
                         if(PLATAFORMA.lista.includes(response.data[i].plataforma) === true && 
                            vm.plataformas.includes(response.data[i].plataforma) === false){
                            vm.plataformas.push(response.data[i].plataforma);
                         }
                         if(REGIAO.lista.includes(response.data[i].regiao) === true && 
                            vm.regioes.includes(response.data[i].regiao) === false){
                            vm.regioes.push(response.data[i].regiao);
                         }
                         if(SITUACAO.lista.includes(response.data[i].situacao) === true && 
                            vm.situacoes.includes(response.data[i].situacao) === false){
                            vm.situacoes.push(response.data[i].situacao);
                         }
                         if(TIPO.lista.includes(response.data[i].tipo) === true && 
                            vm.tipos.includes(response.data[i].tipo) === false){
                            vm.tipos.push(response.data[i].tipo);
                         }
                    };
                    vm.plataformas = ItemFactory.montarObjetoDropdown(ordenar(vm.plataformas)); 
                    vm.generos = ItemFactory.montarObjetoDropdown(ordenar(vm.generos)); 
                    vm.regioes = ItemFactory.montarObjetoDropdown(ordenar(vm.regioes)); 
                    vm.tipos = ItemFactory.montarObjetoDropdown(ordenar(vm.tipos)); 
                    vm.situacoes = ItemFactory.montarObjetoDropdown(ordenar(vm.situacoes)); 
                }                
            }).catch(function onError(response) {
                UserService.checkStatus(response);            
            });
        };        

        function topoPagina(){
            ScrollToService.scrollToTop( 0, 600);
        }


        function modalExcluir(itemIn) {
            vm.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'modules/item/templates/item.listar.modal.html',
                controller: ['$scope','item','remover', function($scope,item,remover ) {
                    var modal = this;
                    modal.titulo = 'Confirmação';
                    modal.remover =remover;
                    modal.item = item;

                    modal.confirm =  function confirm() {
                        modal.remover(modal.item.id);
                        vm.modalInstance.close();
                    };

                    modal.close = function close() {
                        vm.modalInstance.close();
                    };
                }],
                controllerAs: 'confirmCrt',
                keyboard: false,
                backdrop: 'static',
                size: 'md',
                resolve: {
                    remover: function(){
                        return vm.remover;
                    },
                    item: itemIn

                }
            });
        };

        activate();
		
    }
})();
