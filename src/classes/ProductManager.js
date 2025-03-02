import {productSchema} from "../models/products.model.js";

class ProductManager {
    async getProducts() {
        try {
            limit=limit ? limit :4;
            page=page ? page :1;
            query=query ? query :"";
            sort=sort ? sort :"";
            let result

            if(query){
                result = await productSchema.paginate({category:query},{page:page,limit:limit,lean:true})
            }else{
                result = await productSchema.paginate({},{page:page,limit:limit,lean:true})
            }
            return result;
            result = {status:"success",payload:result.docs,totalPages:result.totalPages,prevPage:result.prevPage,nextPage:result.nextPage,page:result.page,hasPrevPage:result.hasPrevPage,hasNextPage:result.hasNextPage}
        } catch (error) {
                return {status:"error",error:"Error al obtener los productos"}
        }
    }

}
