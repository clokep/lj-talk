/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * The XMPP LJ Talk protocol, see http://www.livejournal.com/chat/ for
 * connection details.
 */

const {interfaces: Ci, utils: Cu} = Components;

Cu.import("resource:///modules/imXPCOMUtils.jsm");
Cu.import("resource:///modules/jsProtoHelper.jsm");
Cu.import("resource:///modules/xmpp.jsm");
Cu.import("resource:///modules/xmpp-session.jsm");

initLogModule("ljtalk", this);

XPCOMUtils.defineLazyGetter(this, "_", function()
  l10nHelper("chrome://purple/locale/xmpp.properties")
);

//const HOST = "xmpp.service.livejournal.com";
const HOST = "livejournal.com";
const PORT = 5222;

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
      this._jid = this._parseJID(this.name + "@livejournal.com");
    else
      this._jid = this._parseJID(this.name);

    this._connection = new XMPPSession(HOST, PORT,
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
