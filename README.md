# Example shared Twilio Sync client for Twilio Flex

This repository contains two plugins:

- `plugin-sync-ipc`: This plugin instantiates a Twilio Sync client and exposes it to other plugins via the actions framework, using a new `SyncDocIPC` action.
- `plugin-sync-things`: This plugin has no Twilio Sync client, but accesses and manipulates data in Sync via the `SyncDocIPC` action exposed by `plugin-sync-ipc`. As a simple example of usage, this plugin stores each worker's current activity in a Sync doc, and logs the data from Sync before and after each operation to the browser console.

# How does it work?

This pattern takes advantage of a few behaviors of the Flex actions framework:

1. Action callbacks can modify the action payload
2. `after` action listeners receive the modified payload
3. By `await`ing an action invocation, all `before` and `after` action listeners have executed (assuming they didn't also execute async code without `await`ing it)

Using these three behaviors, we can access Sync via actions by performing the following:

1. The single plugin that is running the Sync client registers an action for other plugins to invoke (called `SyncDocIPC`). The action callback will call the Sync client to perform get/update/close operations, and update `payload.data` with the data from Sync.
2. Each plugin that needs to use Sync registers an `afterSyncDocIPC` action listener to receive the updated `payload.data` value and store it in a cache
3. To perform Sync operations, the plugin invokes the `SyncDocIPC` action and `await`s its completion
4. The cache object is accessed to retrieve the result