/*
    Copyright (C) 2015  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = function(pb) {
    
    //pb dependencies
    var util = pb.util;
    
    /**
     * Deletes a navigation item
     */
    function DeleteNavItem(){}
    util.inherits(DeleteNavItem, pb.BaseController);

    DeleteNavItem.prototype.render = function(cb) {
        var self = this;
        var vars = this.pathVars;

        var message = this.hasRequiredParams(vars, ['id']);
        if (message) {
            cb({
                code: 400,
                content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, message)
            });
            return;
        }

        //ensure existence
        var dao = new pb.DAO();
        dao.loadById(vars.id, 'section', function(err, section) {
            if(section === null) {
                cb({
                    code: 400,
                    content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('INVALID_UID'))
                });
                return;
            }

            //delete the section
            var where = {
                $or: [
                    pb.DAO.getIdWhere(vars.id), 
                    {
                        parent: vars.id
                    }
                ]
            };
            dao.delete(where, 'section', function(err, result) {
                if(util.isError(err) || result < 1) {
                    return cb({
                        code: 500,
                        content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('ERROR_DELETING'))
                    });
                }

                //update the section map
                self.updateNavMap(vars.id, function(err, result) {
                    if(util.isError(err)) {
                        return cb({
                            code: 500,
                            content: pb.BaseController.apiResponse(pb.BaseController.API_ERROR, self.ls.get('ERROR_DELETING'))
                        });
                    }
                    
                    cb({content: pb.BaseController.apiResponse(pb.BaseController.API_SUCCESS, section.name + ' ' + self.ls.get('DELETED'))});
                });
            });
        });
    };

    DeleteNavItem.prototype.updateNavMap = function(removeID, cb) {
        var service = new pb.SectionService();
        service.removeFromSectionMap(removeID, cb);
    };

    //exports
    return DeleteNavItem;
};
