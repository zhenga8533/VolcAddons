register("guiOpened", () => {
    Client.scheduleTask(1, () => {
        if (Player.getContainer().getName() !== "Storage") return;
        
        
    });
});
