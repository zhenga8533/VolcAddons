package com.volcaddons.volcaddonsmod;

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
import net.minecraftforge.fml.common.network.FMLNetworkEvent;

import java.io.*;
import javax.net.ssl.*;
import java.security.*;
import java.net.HttpURLConnection;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipEntry;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.File;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

@Mod(modid = VolcAddons.MODID, version = VolcAddons.VERSION, clientSideOnly = true)
public class VolcAddons {
    public static final String MODID = "VolcAddons";
    public static final String VERSION = "1.1";
    public static VolcAddons INSTANCE;

    private static final String separator = File.separator;
    private static String modDir = System.getProperty("user.home");
    private static String moduleDir = modDir + separator + "ChatTriggers" + separator + "modules" + separator + "VolcAddons";
    private static final String UPDATE_CHECK_URL = "https://api.github.com/repos/zhenga8533/VolcAddons/releases/latest";
    private boolean updateChecked = false;

    @EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        INSTANCE = this;
        EventBus eventBus = MinecraftForge.EVENT_BUS;
        eventBus.register(this);
        ClientCommandHandler.instance.registerCommand(new CommandUpdateVA());
        modDir = event.getModConfigurationDirectory().getAbsolutePath();
        moduleDir = modDir + separator + "ChatTriggers" + separator + "modules" + separator + "VolcAddons";
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

    private String getCurrentVersion() {
        try {
            String metadataPath = moduleDir + separator + "metadata.json";
            String line;
            BufferedReader reader = new BufferedReader(new FileReader(metadataPath));
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
                String latestVersion = releaseJson.get("tag_name").getAsString();
                latestVersion = latestVersion.startsWith("v") ? latestVersion.substring(1) : latestVersion;
                String currentVersion = getCurrentVersion();

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
            player.addChatMessage(new ChatComponentText(
                    EnumChatFormatting.RED + "Error checking for updates: " + e.getMessage()
            ));
        }
    }

    void downloadAndExtractUpdate(EntityPlayer player) {
        ZipInputStream zipInputStream;
        InputStream inputStream = null;
        InputStream trustStoreInputStream;

        try {
            // Load truststore from the classpath
            trustStoreInputStream = VolcAddons.class.getResourceAsStream("/skytilscacerts.jks");
            if (trustStoreInputStream == null) {
                // Truststore not found in the classpath
                throw new FileNotFoundException("Truststore file not found");
            }

            /**
             *
             * Create and load the truststore.
             * Tried for 6 hours to create my own CA certified jks but failed...
             * Assuming I can use ST cert since it's open source :).
             * LMK if this needs to be changed, bedge.
             */
            KeyStore trustStore = KeyStore.getInstance("JKS");
            trustStore.load(trustStoreInputStream, "skytilsontop".toCharArray());

            // Initialize TrustManagerFactory with the loaded truststore
            TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            trustManagerFactory.init(trustStore);

            // Initialize SSLContext with the trust managers from TrustManagerFactory
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagerFactory.getTrustManagers(), null);

            // Set the default SSL socket factory
            HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());

            // Fetch information about the latest release
            URL apiUrl = new URL(UPDATE_CHECK_URL);
            HttpURLConnection connection = (HttpURLConnection) apiUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;

                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                // Parse JSON response
                JsonObject releaseJson = new JsonParser().parse(response.toString()).getAsJsonObject();
                String latestVersion = releaseJson.get("tag_name").getAsString();

                // Extract URL of the zip file from the assets array
                JsonArray assets = releaseJson.get("assets").getAsJsonArray();
                String zipUrl = null;
                for (int i = 0; i < assets.size(); i++) {
                    JsonObject asset = assets.get(i).getAsJsonObject();
                    if (asset.get("name").getAsString().equals("VolcAddons.zip")) {
                        zipUrl = asset.get("browser_download_url").getAsString();
                        break;
                    }
                }

                if (zipUrl != null) {
                    try {
                        // Download the ZIP file
                        inputStream = new URL(zipUrl).openStream();
                        FileOutputStream fileOutputStream = new FileOutputStream("VolcAddons.zip");
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            fileOutputStream.write(buffer, 0, bytesRead);
                        }
                        fileOutputStream.close();
                        inputStream.close();

                        // Extract the contents of the ZIP file
                        zipInputStream = new ZipInputStream(new FileInputStream("VolcAddons.zip"));
                        ZipEntry entry;
                        while ((entry = zipInputStream.getNextEntry()) != null) {
                            String entryName = entry.getName();
                            String entryPath = moduleDir + separator + entryName;
                            if (!entry.isDirectory()) {
                                // Create directories if they don't exist
                                File entryFile = new File(entryPath);
                                File parentDir = new File(entryFile.getParent());
                                if (!parentDir.exists()) {
                                    parentDir.mkdirs();
                                }

                                // Copy entry contents to the destination directory
                                FileOutputStream fileOutputStreamEntry = new FileOutputStream(entryFile);
                                while ((bytesRead = zipInputStream.read(buffer)) != -1) {
                                    fileOutputStreamEntry.write(buffer, 0, bytesRead);
                                }
                                fileOutputStreamEntry.close();
                            }
                        }
                        zipInputStream.close();

                        // Inform the user about the successful update
                        player.addChatMessage(new ChatComponentText(EnumChatFormatting.GREEN +
                                "Update successful: New version " + latestVersion + " downloaded!"
                        ));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                } else {
                    // If the zipUrl is null, it means the VolcAddons.zip file was not found in the release assets
                    player.addChatMessage(new ChatComponentText(EnumChatFormatting.RED +
                            "Error: VolcAddons.zip not found in the latest release assets!"
                    ));
                }
            } else {
                // If the connection to the GitHub API fails
                player.addChatMessage(new ChatComponentText(EnumChatFormatting.RED +
                        "Error fetching latest release information from GitHub API!"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            player.addChatMessage(new ChatComponentText(EnumChatFormatting.RED +
                    "Update failed: " + e
            ));
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
