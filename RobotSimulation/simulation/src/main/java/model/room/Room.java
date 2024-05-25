package main.java.model.room;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import main.java.model.common.Environment;
import main.java.model.common.Position;
import main.java.model.common.Robot;
import main.java.model.common.Obstacle;

import main.java.controller.RobotController;

import java.io.*;
import java.util.ArrayList;
import java.util.List;


/**
 * Represents the room environment
 */
public class Room implements Environment {
    private final double width;
    private final double height;

    private final List<Robot> robots;
    private final List<Obstacle> obstacles;

    private final int OBSTACLE_SIZE = 20;
    private final int ROBOT_SIZE = 10;

    private File logFile;
    private File saveFile;

    public Room(double width, double height) {
        this.width = width;
        this.height = height;
        this.robots = new ArrayList<>();
        this.obstacles = new ArrayList<>();
        this.logFile = new File("log.json");
        this.saveFile = new File("save.json");
    }

    /**
     * Create a room with a width and height
     *
     * @param width  the width
     * @param height the height
     * @return the room
     */
    public static Room create(double width, double height) {
        if (width > 0 && height > 0) {
            return new Room(width, height);
        }
        throw new IllegalArgumentException("Invalid room dimensions");
    }

    public boolean containsPosition(Position pos) {
        return pos.getX() >= 0 && pos.getX() < this.width && pos.getY() >= 0 && pos.getY() < this.height;
    }

    public boolean addRobot(Robot robot) {
        Position p = robot.getPosition();
        if (this.containsPosition(p) && !this.robotAt(p)) {
            this.robots.add(robot);

            return true;
        }
        return false;
    }

    public boolean createObstacleAt(Position p) {
        if (this.containsPosition(p) && !this.obstacleAt(p)) {
            this.obstacles.add(new Obstacle(this, p));
            return true;
        }
        return false;
    }

    public boolean createObstacleAt(double x, double y) {
        return this.createObstacleAt(new Position(x, y));
    }

    public boolean obstacleAt(Position p) {
        for (Obstacle obstacle : this.obstacles) {
            double left = obstacle.getX() - OBSTACLE_SIZE / 2.0;
            double right = obstacle.getX() + OBSTACLE_SIZE / 2.0;
            double top = obstacle.getY() - OBSTACLE_SIZE / 2.0;
            double bottom = obstacle.getY() + OBSTACLE_SIZE / 2.0;

            if (p.getX() >= left && p.getX() <= right && p.getY() >= top && p.getY() <= bottom) {
                return true;
            }
        }
        return false;
    }

    public boolean robotAt(Position p) {
        for (Robot robot : this.robots) {
            double distance = Math.sqrt(Math.pow(p.getX() - robot.getPosition().getX(), 2) + Math.pow(p.getY() - robot.getPosition().getY(), 2));
            if (distance <= ROBOT_SIZE / 2.0){
                return true;
            }
        }
        return false;
    }

    // saves the current state of the room to json file
    public void log() {
        try {
            // Read current content of the log file
            StringBuilder currentContent = new StringBuilder();
            if (logFile.exists()) {
                BufferedReader reader = new BufferedReader(new FileReader(logFile));
                String line;
                while ((line = reader.readLine()) != null) {
                    currentContent.append(line).append("\n");
                }
                reader.close();
            }

            // if the file is empty, add the opening bracket
            if (currentContent.length() == 0) {
                currentContent.append("{ \"frames\": [\n");
            }

            // if its not a first frame, add a comma
            if (currentContent.charAt(currentContent.length() - 2) == '}') {
                currentContent.insert(currentContent.length() - 1, ",");
            }

            // Append room state to the current content
            currentContent.append(this.toString());

            // Write the updated content back to the file
            FileWriter writer = new FileWriter(logFile);
            writer.write(currentContent.toString());
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // stops logging by adding the closing bracket
    public void stopLog() {
        try {
            // Read current content of the log file
            StringBuilder currentContent = new StringBuilder();
            if (logFile.exists()) {
                BufferedReader reader = new BufferedReader(new FileReader(logFile));
                String line;
                while ((line = reader.readLine()) != null) {
                    currentContent.append(line).append("\n");
                }
                reader.close();
            }

            // if the file is empty, add the opening bracket
            if (currentContent.length() == 0) {
                return;
            }

            // Append room state to the current content
            currentContent.append("] }");

            // Write the updated content back to the file
            FileWriter writer = new FileWriter(logFile);
            writer.write(currentContent.toString());
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void save() {
        try {
            FileWriter writer = new FileWriter(saveFile);
            writer.write(this.toString());
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void clearLog() {
        try {
            FileWriter writer = new FileWriter(logFile);
            writer.write("");
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void preload(File file){
        try {
            FileReader fileReader = new FileReader(file);
            JsonParser parser = new JsonParser();
            JsonObject json = parser.parse(fileReader).getAsJsonObject();

            load(json);

            fileReader.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public void load(JsonObject json){
        try {

            JsonArray robotArray = json.getAsJsonArray("robots");
            JsonArray obstacleArray = json.getAsJsonArray("obstacles");

            // Clear existing robots and obstacles
            this.clear();

            // Load robots
            for (JsonElement element : robotArray) {
                JsonObject robotObject = element.getAsJsonObject();
                double x = robotObject.get("x").getAsDouble();
                double y = robotObject.get("y").getAsDouble();
                boolean controlled = robotObject.get("Controlled").getAsBoolean();
                int id = robotObject.get("id").getAsInt();
                double currentAngle = robotObject.get("currentAngle").getAsDouble();
                double turnAngle = robotObject.get("turnAngle").getAsDouble();

                if (controlled) {
                    Robot robot = ControlledRobot.create(this, new Position(x, y), id, 1);
                    if (robot != null) {
                        this.robots.add(robot);
                    }
                } else {
                    Robot robot = AutonomousRobot.create(this, new Position(x, y), 1, 1, true, id, turnAngle, currentAngle);
                    if (robot != null) {
                        this.robots.add(robot);
                    }
                }
            }

            // Load obstacles
            for (JsonElement element : obstacleArray) {
                JsonObject obstacleObject = element.getAsJsonObject();
                double x = obstacleObject.get("x").getAsDouble();
                double y = obstacleObject.get("y").getAsDouble();

                Obstacle obstacle = new Obstacle(this, new Position(x, y));
                this.obstacles.add(obstacle);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }

    public void rewind(RobotController robotController) {
        try {
            FileReader fileReader = new FileReader(logFile);
            JsonParser parser = new JsonParser();
            JsonObject json = parser.parse(fileReader).getAsJsonObject();
            JsonArray frames = json.getAsJsonArray("frames");

            this.clear();

            //for loop backwards

            for (int i = frames.size() - 1; i >= 0; i--) {
                JsonObject frame = frames.get(i).getAsJsonObject();
                JsonArray robotArray = frame.getAsJsonArray("robots");
                JsonArray obstacleArray = frame.getAsJsonArray("obstacles");

                load(frame);

                robotController.rewind_update();
                // Thread.sleep(1000);
            }

            fileReader.close();

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n");
        sb.append("  \"robots\": [\n");
        if (this.robots.size() > 0) {
            for (Robot robot : this.robots) {
                sb.append("    ").append(robot.toString()).append(",\n");
            }
            // remove last comma
            sb.deleteCharAt(sb.length() - 2);
        }
        sb.append("  ],\n");
        sb.append("  \"obstacles\": [\n");
        if (this.obstacles.size() > 0) {
            for (Obstacle obstacle : this.obstacles) {
                sb.append("    ").append(obstacle.toString()).append(",\n");
            }
            // remove last comma
            sb.deleteCharAt(sb.length() - 2);
        }

        sb.append("  ]\n");
        sb.append("}\n");
        return sb.toString();
    }

    public List<Robot> getRobots() {
        return this.robots;
    }

    public List<Obstacle> getObstacles() {
        return this.obstacles;
    }

    public void clear() {
        this.robots.clear();
        this.obstacles.clear();
    }

    public double getWidth() {
        return this.width;
    }

    public double getHeight() {
        return this.height;
    }
}
