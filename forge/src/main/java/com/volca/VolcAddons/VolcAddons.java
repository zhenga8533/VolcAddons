package com.volca.VolcAddons;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import net.minecraft.client.Minecraft;
import net.minecraft.event.ClickEvent;
import net.minecraft.util.ChatStyle;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.ClientCommandHandler;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.Mod.EventHandler;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.EventBus;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraft.util.ChatComponentText;
import net.minecraft.entity.player.EntityPlayer;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import net.minecraftforge.fml.common.network.FMLNetworkEvent;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;

@Mod(modid = VolcAddons.MODID, version = VolcAddons.VERSION, clientSideOnly = true)
public class VolcAddons {
    public static final String MODID = "VolcAddons";
    public static final String VERSION = "1.0";
    public static VolcAddons INSTANCE;

    String modDir = System.getProperty("user.home");
    private static final String UPDATE_CHECK_URL = "https://api.github.com/repos/zhenga8533/VolcAddons/releases/latest";
    private boolean updateChecked = false;
    private String latestVersion = "1.0.0";

    @EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        INSTANCE = this;
        EventBus eventBus = MinecraftForge.EVENT_BUS;
        eventBus.register(this);
        ClientCommandHandler.instance.registerCommand(new CommandUpdateVA());
        modDir = event.getModConfigurationDirectory().getAbsolutePath();
    }

    @SubscribeEvent
    public void onClientConnected(FMLNetworkEvent.ClientConnectedToServerEvent event) {
        if (!updateChecked) {
            ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

            // Schedule checkForUpdates() after a delay of 3 seconds
            scheduler.schedule(new Runnable() {
                @Override
                public void run() {
                    final EntityPlayer player = Minecraft.getMinecraft().thePlayer;
                    checkForUpdates(player);
                    updateChecked = true;
                }
            }, 3, TimeUnit.SECONDS);

            // Shutdown the scheduler when it's no longer needed
            scheduler.shutdown();
        }
    }

    private void checkForUpdates(EntityPlayer player) {
        try {
            URL url = new URL(UPDATE_CHECK_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();

                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                reader.close();
                connection.disconnect();

                String jsonResponse = response.toString();
                JsonParser jsonParser = new JsonParser();
                JsonObject releaseJson = jsonParser.parse(jsonResponse).getAsJsonObject();
                latestVersion = releaseJson.get("tag_name").getAsString();
                latestVersion = latestVersion.startsWith("v") ? latestVersion.substring(1) : latestVersion;

                String metadataPath = modDir + File.separator + "ChatTriggers" + File.separator + "modules" +
                        File.separator + "VolcAddons" + File.separator + "metadata.json";

                String currentVersion = getCurrentVersion(metadataPath);

                if (isNewerVersion(latestVersion, currentVersion)) {
                    player.addChatMessage(new ChatComponentText(
                            EnumChatFormatting.GRAY + "\n[" +
                                 EnumChatFormatting.GOLD + "VolcAddons" +
                                 EnumChatFormatting.GRAY + "] " +
                                 EnumChatFormatting.GOLD + EnumChatFormatting.BOLD + "A new update is available: " +
                                 EnumChatFormatting.WHITE + EnumChatFormatting.BOLD + "v" + latestVersion
                    ));
                    player.addChatMessage(new ChatComponentText(
                            EnumChatFormatting.GREEN + "Click here or run '" +
                                 EnumChatFormatting.WHITE + "/updateva" +
                                 EnumChatFormatting.GREEN + "' to update!\n"
                    ).setChatStyle(new ChatStyle().setChatClickEvent(
                            new ClickEvent(ClickEvent.Action.RUN_COMMAND, "/updateva") {
                                @Override
                                public Action getAction() {
                                    //custom behavior
                                    return Action.RUN_COMMAND;
                                }
                            })
                    ));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean isNewerVersion(String version1, String version2) {
        String[] splitVersion1 = version1.split("\\.");
        String[] splitVersion2 = version2.split("\\.");

        for (int i = 0; i < Math.min(splitVersion1.length, splitVersion2.length); i++) {
            int v1 = Integer.parseInt(splitVersion1[i]);
            int v2 = Integer.parseInt(splitVersion2[i]);

            if (v1 > v2) {
                return true;
            } else if (v1 < v2) {
                return false;
            }
        }

        return splitVersion1.length > splitVersion2.length;
    }

    void downloadAndExtractUpdate(EntityPlayer player) {
        try {
            String releasesUrl = "https://api.github.com/repos/zhenga8533/VolcAddons/releases/latest";

            URL url = new URL(releasesUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/vnd.github.v3+json");
            connection.connect();

            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();

                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                reader.close();
                connection.disconnect();

                String jsonResponse = response.toString();
                JsonParser parser = new JsonParser();
                JsonObject releaseJson = parser.parse(jsonResponse).getAsJsonObject();
                String downloadUrl = releaseJson.getAsJsonArray("assets")
                        .get(0).getAsJsonObject()
                        .get("browser_download_url").getAsString();

                File modulesDir = new File(modDir + File.separator + "ChatTriggers" + File.separator + "modules");
                modulesDir.mkdirs();

                URL fileUrl = new URL(downloadUrl);
                String fileName = fileUrl.getFile().substring(fileUrl.getFile().lastIndexOf('/') + 1);
                File zipFile = new File(modulesDir, fileName);

                InputStream inputStream = null;
                OutputStream outputStream = null;
                try {
                    inputStream = fileUrl.openStream();
                    outputStream = new FileOutputStream(zipFile);
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                } finally {
                    if (inputStream != null) {
                        inputStream.close();
                    }
                    if (outputStream != null) {
                        outputStream.close();
                    }
                }

                extractZipFile(zipFile, modulesDir);

                zipFile.delete();

                // Notify the player about the update status
                player.addChatMessage(new ChatComponentText(
                        EnumChatFormatting.GREEN + "Update successful: New version " +
                             EnumChatFormatting.WHITE + "v" + latestVersion +
                             EnumChatFormatting.GREEN + " downloaded!"
                ));
                player.addChatMessage(new ChatComponentText(
                        "" + EnumChatFormatting.GRAY + EnumChatFormatting.ITALIC +
                             "You may need to run '/ct load' for effects to take place!\n"
                ));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void extractZipFile(File zipFile, File destinationDir) throws IOException {
        FileInputStream fis = null;
        ZipArchiveInputStream zipStream = null;

        try {
            fis = new FileInputStream(zipFile);
            zipStream = new ZipArchiveInputStream(fis);
            ZipArchiveEntry entry;

            while ((entry = zipStream.getNextZipEntry()) != null) {
                File entryFile = new File(destinationDir, entry.getName());

                if (entry.isDirectory()) {
                    entryFile.mkdirs();
                } else {
                    FileOutputStream outputStream = null;

                    try {
                        outputStream = new FileOutputStream(entryFile);
                        byte[] buffer = new byte[1024];
                        int bytesRead;

                        while ((bytesRead = zipStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                        }
                    } finally {
                        if (outputStream != null) {
                            outputStream.close();
                        }
                    }
                }
            }
        } finally {
            if (zipStream != null) {
                zipStream.close();
            }
            if (fis != null) {
                fis.close();
            }
        }
    }

    private String getCurrentVersion(String metadataPath) {
        try {
            BufferedReader reader = new BufferedReader(new FileReader(metadataPath));
            String line;
            StringBuilder content = new StringBuilder();

            while ((line = reader.readLine()) != null) {
                content.append(line);
            }

            reader.close();

            JsonObject metadata = new JsonParser().parse(content.toString()).getAsJsonObject();
            return metadata.get("version").getAsString();
        } catch (IOException e) {
            e.printStackTrace();
            return "1.0.0";
        }
    }
}
