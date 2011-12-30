/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is LJ Talk.
 *
 * The Initial Developer of the Original Code is
 * Patrick Cloke <clokep@gmail.com>.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const {interfaces: Ci, utils: Cu} = Components;

Cu.import("resource:///modules/imXPCOMUtils.jsm");
Cu.import("resource:///modules/jsProtoHelper.jsm");
Cu.import("resource:///modules/xmpp.jsm");
Cu.import("resource:///modules/xmpp-session.jsm");

XPCOMUtils.defineLazyGetter(this, "_", function()
  l10nHelper("chrome://purple/locale/xmpp.properties")
);

function LJTalkAccount(aProtoInstance, aImAccount) {
  this._init(aProtoInstance, aImAccount);
}
LJTalkAccount.prototype = {
  __proto__: XMPPAccountPrototype,
  get canJoinChat() false,
  connect: function() {
    // New accounts will give just a username, but old accounts (from libpurple
    // XMPP will have the full JID).
    if (this.name.indexOf("@") == -1)
      this._jid = this._parseJID(this.name + "@livejournal.com/instantbird");
    else
      this._jid = this._parseJID(this.name);
      

    this._connection = new XMPPSession("livejournal.com", 5222,
                                       "require_tls", this._jid,
                                       this.imAccount.password, this);
  }
};

function ljtalkProtocol() { }
ljtalkProtocol.prototype = {
  __proto__: GenericProtocolPrototype,
  
  // This should match the second half of the category in the chrome.manifest
  // file (e.g. prpl-ljtalk).
  get normalizedName() "ljtalk",
  // The display name (in the account manager, etc.).
  get name() "LJ Talk",
  // This chrome URL should be registered as a skin in chrome.manifest, it needs
  // to contain three images that are the icons of the protocol: icon.png
  // (16x16), icon32.png (32x32) and icon48.png (48x48).
  get iconBaseURI() "chrome://prpl-ljtalk/skin/",

  getAccount: function(aImAccount) new LJTalkAccount(this, aImAccount),
  
  options: {
    resource: {get label() _("options.resource"), default: "instantbird"}
  },
  
  // A UUID, you can ask instantbot in #instantbird on moznet to generate one
  // for you (by asking "instantbot: uuid"). This needs to match the component
  // IDs in your chrome.manifest.
  classID: Components.ID("{88f1f395-3ebd-4357-afa6-78e7a17715b4}")
};

var NSGetFactory = XPCOMUtils.generateNSGetFactory([ljtalkProtocol]);
