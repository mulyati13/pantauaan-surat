const {letterQueries, approvalQueries, userQueries} = require('../queries')
const message = require('../../response-helpers/messages').MESSAGE
const responseHendler = require('../../response-helpers/error-helper')
const { approvalDecorator } = require('../decorators/approvals-decorator')


class approvalController {

    async createApproval(req, res) {
        //logic:
        //menentukan surat yang akan diminta approval
        //create aproval
        try {
            const payloadParams = req.params
            const payloadBody = req.body

            const findSurat = await letterQueries.findSurat(payloadParams)
            if(!findSurat) { return responseHendler.notFound(res, message('letter').notFoundResource)}

            const findUser = await userQueries.findUserByName(payloadBody)
            if(!findUser) { return responseHendler.notFound(res, message('user tujuan').notFoundResource)}

            const findApproval = await approvalQueries.findApprovalStatus('process')
            if(findApproval) { return responseHendler.badRequest(res,message('approval sudah diprocess').errorMessage)}

            const createApproval = await approvalQueries.createApproval(findSurat.id, 'process','',findUser.id)
            if(!createApproval) { return responseHendler.badRequest(res, message('approval').incompleteKeyOrValue)}

            return responseHendler.ok(res, message('send approval').success)
        }

        catch(err) {
            const key = err.message
            console.log(key)
            return responseHendler.internalError(res, message(key).errorMessage)
        }
    }

    async getApproval(req, res) {

        try {
            const auth = req.userId
            const findApproval = await approvalQueries.findApproval(auth)
            if(!findApproval) { return responseHendler.notFound(res, message('approval').notFoundResource)}

            const data = await approvalDecorator(findApproval)
            return responseHendler.ok(res, message('get approval').success, data)
        }
        catch(err) {
            const key = err.message
            console.log(key)
            return responseHendler.internalError(res, message(key).errorMessage)
        }
        
    }
}

module.exports = {
    approvalController
}